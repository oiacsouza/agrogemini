from fastapi import APIRouter, Depends

from app.db.database import get_db_connection
from app.core.deps import get_current_user
from app.schemas.fazenda import TalhaoCreate, TalhaoUpdate
from app.repositories.talhao_repository import TalhaoRepository

router = APIRouter(prefix="/api/v1/talhoes", tags=["Talhões"])


@router.get("/")
async def list_talhoes(db=Depends(get_db_connection), _=Depends(get_current_user)):
    return TalhaoRepository(db).get_all()


@router.get("/{talhao_id}")
async def get_talhao(talhao_id: int, db=Depends(get_db_connection), _=Depends(get_current_user)):
    repo = TalhaoRepository(db)
    t = repo.get_by_id(talhao_id)
    if not t:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Talhão não encontrado")
    return t


@router.post("/", status_code=201)
async def create_talhao(data: TalhaoCreate, db=Depends(get_db_connection), _=Depends(get_current_user)):
    repo = TalhaoRepository(db)
    tid = repo.create(data)
    return repo.get_by_id(tid)


@router.put("/{talhao_id}")
async def update_talhao(talhao_id: int, data: TalhaoUpdate, db=Depends(get_db_connection), _=Depends(get_current_user)):
    repo = TalhaoRepository(db)
    repo.update(talhao_id, data)
    return repo.get_by_id(talhao_id)


@router.delete("/{talhao_id}")
async def delete_talhao(talhao_id: int, db=Depends(get_db_connection), _=Depends(get_current_user)):
    TalhaoRepository(db).delete(talhao_id)
    return {"detail": "Talhão removido"}
