from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session
from app.core.deps import require_role
from app.schemas.fazenda import FazendaCreate, FazendaUpdate, FazendaResponse
from app.services.fazenda_service import FazendaService

router = APIRouter(prefix="/api/v1/fazendas", tags=["Fazendas"])


@router.get("/", response_model=list[FazendaResponse])
async def list_fazendas(
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "ADM")),
):
    return await FazendaService(db).get_all()


@router.get("/{id}", response_model=FazendaResponse)
async def get_fazenda(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "ADM")),
):
    return await FazendaService(db).get_by_id(id)


@router.post("/", response_model=FazendaResponse)
async def create_fazenda(
    data: FazendaCreate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "ADM")),
):
    return await FazendaService(db).create(data)


@router.put("/{id}", response_model=FazendaResponse)
async def update_fazenda(
    id: int,
    data: FazendaUpdate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "ADM")),
):
    return await FazendaService(db).update(id, data)


@router.delete("/{id}")
async def delete_fazenda(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "ADM")),
):
    return await FazendaService(db).delete(id)


@router.get("/{id}/usuarios")
async def get_fazenda_usuarios(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "ADM")),
):
    return await FazendaService(db).get_usuarios(id)


@router.get("/{id}/talhoes")
async def get_fazenda_talhoes(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "ADM")),
):
    return await FazendaService(db).get_talhoes(id)
