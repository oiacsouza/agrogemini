from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session
from app.core.deps import require_role
from app.schemas.fazenda import TalhaoCreate, TalhaoUpdate, TalhaoResponse
from app.services.fazenda_service import FazendaService

router = APIRouter(prefix="/api/v1/talhoes", tags=["Talhoes"])


@router.get("/", response_model=list[TalhaoResponse])
async def list_talhoes(
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "ADM")),
):
    return await FazendaService(db).get_all_talhoes()


@router.get("/{id}", response_model=TalhaoResponse)
async def get_talhao(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "ADM")),
):
    return await FazendaService(db).get_talhao_by_id(id)


@router.post("/", response_model=TalhaoResponse)
async def create_talhao(
    data: TalhaoCreate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "ADM")),
):
    return await FazendaService(db).create_talhao(data)


@router.put("/{id}", response_model=TalhaoResponse)
async def update_talhao(
    id: int,
    data: TalhaoUpdate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "ADM")),
):
    return await FazendaService(db).update_talhao(id, data)


@router.delete("/{id}")
async def delete_talhao(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "ADM")),
):
    return await FazendaService(db).delete_talhao(id)
