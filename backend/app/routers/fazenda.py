from fastapi import APIRouter, Depends

from app.db.database import get_db_connection
from app.core.deps import get_current_user
from app.schemas.fazenda import FazendaCreate, FazendaUpdate, FazendaUsuarioCreate
from app.services.fazenda_service import FazendaService

router = APIRouter(prefix="/api/v1/fazendas", tags=["Fazendas"])


@router.get("/")
async def list_fazendas(db=Depends(get_db_connection), _=Depends(get_current_user)):
    return FazendaService(db).get_all()


@router.get("/{fazenda_id}")
async def get_fazenda(fazenda_id: int, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return FazendaService(db).get_by_id(fazenda_id)


@router.post("/", status_code=201)
async def create_fazenda(data: FazendaCreate, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return FazendaService(db).create(data)


@router.put("/{fazenda_id}")
async def update_fazenda(fazenda_id: int, data: FazendaUpdate, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return FazendaService(db).update(fazenda_id, data)


@router.delete("/{fazenda_id}")
async def delete_fazenda(fazenda_id: int, db=Depends(get_db_connection), _=Depends(get_current_user)):
    FazendaService(db).delete(fazenda_id)
    return {"detail": "Fazenda removida"}


@router.get("/{fazenda_id}/talhoes")
async def list_talhoes(fazenda_id: int, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return FazendaService(db).get_talhoes(fazenda_id)


@router.get("/{fazenda_id}/usuarios")
async def list_fazenda_usuarios(fazenda_id: int, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return FazendaService(db).get_usuarios(fazenda_id)


@router.post("/{fazenda_id}/usuarios", status_code=201)
async def add_fazenda_usuario(fazenda_id: int, data: FazendaUsuarioCreate, db=Depends(get_db_connection), _=Depends(get_current_user)):
    assoc_id = FazendaService(db).add_usuario(data)
    return {"id": assoc_id}
