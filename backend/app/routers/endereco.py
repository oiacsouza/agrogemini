from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session
from app.core.deps import require_role
from app.schemas.endereco import EnderecoCreate, EnderecoUpdate, EnderecoResponse
from app.services.endereco_service import EnderecoService

router = APIRouter(prefix="/api/v1/enderecos", tags=["Enderecos"])


@router.get("/", response_model=list[EnderecoResponse])
async def list_enderecos(
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("ADM")),
):
    return await EnderecoService(db).get_all()


@router.get("/{id}", response_model=EnderecoResponse)
async def get_endereco(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "UP", "UC", "ADM")),
):
    return await EnderecoService(db).get_by_id(id)


@router.post("/", response_model=EnderecoResponse)
async def create_endereco(
    data: EnderecoCreate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "UP", "UC", "ADM")),
):
    return await EnderecoService(db).create(data)


@router.put("/{id}", response_model=EnderecoResponse)
async def update_endereco(
    id: int,
    data: EnderecoUpdate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "UP", "UC", "ADM")),
):
    return await EnderecoService(db).update(id, data)


@router.delete("/{id}")
async def delete_endereco(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("ADM")),
):
    return await EnderecoService(db).delete(id)
