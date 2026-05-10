from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session
from app.core.deps import require_role, get_current_user
from app.schemas.laboratorio import LaboratorioCreate, LaboratorioUpdate, LaboratorioResponse
from app.services.laboratorio_service import LaboratorioService

router = APIRouter(prefix="/api/v1/laboratorios", tags=["Laboratorios"])


@router.get("/", response_model=list[LaboratorioResponse])
async def list_laboratorios(
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("ADM")),
):
    return await LaboratorioService(db).get_all()


@router.get("/me", response_model=list[LaboratorioResponse])
async def list_my_laboratorios(
    db: AsyncSession = Depends(get_db_session),
    current_user=Depends(get_current_user),
):
    """List labs linked to the authenticated user."""
    return await LaboratorioService(db).get_by_user(current_user["id"])


@router.get("/{id}", response_model=LaboratorioResponse)
async def get_laboratorio(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    return await LaboratorioService(db).get_by_id(id)


@router.post("/", response_model=LaboratorioResponse)
async def create_laboratorio(
    data: LaboratorioCreate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("ADM")),
):
    return await LaboratorioService(db).create(data)


@router.put("/{id}", response_model=LaboratorioResponse)
async def update_laboratorio(
    id: int,
    data: LaboratorioUpdate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "ADM")),
):
    return await LaboratorioService(db).update(id, data)


@router.delete("/{id}")
async def delete_laboratorio(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("ADM")),
):
    return await LaboratorioService(db).delete(id)


@router.get("/{id}/usuarios")
async def get_lab_usuarios(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "ADM")),
):
    return await LaboratorioService(db).get_usuarios(id)


@router.get("/{id}/telefones")
async def get_lab_telefones(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    return await LaboratorioService(db).get_telefones(id)
