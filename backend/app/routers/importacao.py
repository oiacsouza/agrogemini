from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session
from app.core.deps import require_role
from app.schemas.importacao import ImportacaoCreate, ImportacaoUpdate, ImportacaoResponse
from app.services.access_control import LabAccessService
from app.services.importacao_service import ImportacaoService

router = APIRouter(prefix="/api/v1/importacoes", tags=["Importacoes"])


@router.get("/", response_model=list[ImportacaoResponse])
async def list_importacoes(
    lab_id: int = Query(..., description="ID do laboratório"),
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    access = LabAccessService(db)
    return await ImportacaoService(db).get_all_by_labs(await access.metric_lab_ids_for_user(user, lab_id))


@router.get("/{id}", response_model=ImportacaoResponse)
async def get_importacao(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    importacao = await ImportacaoService(db).get_by_id(id)
    await LabAccessService(db).assert_lab_access(user, importacao.laboratorio_id)
    return importacao


@router.post("/", response_model=ImportacaoResponse)
async def create_importacao(
    data: ImportacaoCreate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    await LabAccessService(db).assert_lab_access(user, data.laboratorio_id)
    return await ImportacaoService(db).create(data)


@router.put("/{id}", response_model=ImportacaoResponse)
async def update_importacao(
    id: int,
    data: ImportacaoUpdate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    importacao = await ImportacaoService(db).get_by_id(id)
    await LabAccessService(db).assert_lab_access(user, importacao.laboratorio_id)
    return await ImportacaoService(db).update(id, data)


@router.delete("/{id}")
async def delete_importacao(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    importacao = await ImportacaoService(db).get_by_id(id)
    await LabAccessService(db).assert_lab_access(user, importacao.laboratorio_id)
    return await ImportacaoService(db).delete(id)
