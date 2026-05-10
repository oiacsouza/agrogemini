from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session
from app.core.deps import require_role
from app.schemas.laudo import LaudoCreate, LaudoUpdate, LaudoResponse, LaudoResultadoCreate
from app.services.laudo_service import LaudoService

router = APIRouter(prefix="/api/v1/laudos", tags=["Laudos"])


@router.get("/", response_model=list[LaudoResponse])
async def list_laudos(
    lab_id: int = Query(..., description="ID do laboratório"),
    limit: int = Query(100),
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    return await LaudoService(db).get_all(lab_id, limit)


@router.get("/{id}", response_model=LaudoResponse)
async def get_laudo(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "UP", "UC", "ADM")),
):
    return await LaudoService(db).get_by_id(id)


@router.get("/amostra/{amostra_id}", response_model=LaudoResponse)
async def get_laudo_by_amostra(
    amostra_id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "UP", "UC", "ADM")),
):
    return await LaudoService(db).get_by_amostra(amostra_id)


@router.get("/cliente/{cliente_id}", response_model=list[LaudoResponse])
async def get_laudos_by_cliente(
    cliente_id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "ADM")),
):
    return await LaudoService(db).get_by_cliente(cliente_id)


@router.post("/", response_model=LaudoResponse)
async def create_laudo(
    data: LaudoCreate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    return await LaudoService(db).create(data)


@router.put("/{id}", response_model=LaudoResponse)
async def update_laudo(
    id: int,
    data: LaudoUpdate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    return await LaudoService(db).update(id, data)


@router.get("/{id}/resultados")
async def get_laudo_resultados(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UE", "UP", "UC", "ADM")),
):
    return await LaudoService(db).get_resultados(id)


@router.post("/{id}/resultados")
async def add_laudo_resultado(
    id: int,
    data: LaudoResultadoCreate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    return await LaudoService(db).add_resultado(id, data)
