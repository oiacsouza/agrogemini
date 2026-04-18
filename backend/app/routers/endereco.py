from fastapi import APIRouter, Depends

from app.db.database import get_db_connection
from app.core.deps import get_current_user
from app.schemas.endereco import EnderecoCreate, EnderecoUpdate, EnderecoResponse
from app.services.endereco_service import EnderecoService

router = APIRouter(prefix="/api/v1/enderecos", tags=["Endereços"])


@router.get("/")
async def list_enderecos(db=Depends(get_db_connection), _=Depends(get_current_user)):
    return EnderecoService(db).get_all()


@router.get("/{endereco_id}")
async def get_endereco(endereco_id: int, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return EnderecoService(db).get_by_id(endereco_id)


@router.post("/", status_code=201)
async def create_endereco(data: EnderecoCreate, db=Depends(get_db_connection), _=Depends(get_current_user)):
    eid = EnderecoService(db).create(data)
    return EnderecoService(db).get_by_id(eid)


@router.put("/{endereco_id}")
async def update_endereco(endereco_id: int, data: EnderecoUpdate, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return EnderecoService(db).update(endereco_id, data)


@router.delete("/{endereco_id}")
async def delete_endereco(endereco_id: int, db=Depends(get_db_connection), _=Depends(get_current_user)):
    EnderecoService(db).delete(endereco_id)
    return {"detail": "Endereço removido"}
