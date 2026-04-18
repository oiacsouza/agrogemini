from fastapi import APIRouter, Depends, Query
from typing import Optional

from app.db.database import get_db_connection
from app.core.deps import get_current_user
from app.schemas.laudo import LaudoCreate, LaudoUpdate, LaudoResultadoCreate
from app.services.laudo_service import LaudoService

router = APIRouter(prefix="/api/v1/laudos", tags=["Laudos"])


@router.get("/")
async def list_laudos(
    lab_id: Optional[int] = Query(None),
    limit: int = Query(100, le=500),
    db=Depends(get_db_connection),
    _=Depends(get_current_user),
):
    return LaudoService(db).get_all(lab_id=lab_id, limit=limit)


@router.get("/cliente/{cliente_id}")
async def list_por_cliente(cliente_id: int, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return LaudoService(db).get_by_cliente(cliente_id)


@router.get("/amostra/{amostra_id}")
async def list_por_amostra(amostra_id: int, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return LaudoService(db).get_by_amostra(amostra_id)


@router.get("/{laudo_id}")
async def get_laudo(laudo_id: int, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return LaudoService(db).get_by_id(laudo_id)


@router.post("/", status_code=201)
async def create_laudo(data: LaudoCreate, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return LaudoService(db).create(data)


@router.put("/{laudo_id}")
async def update_laudo(laudo_id: int, data: LaudoUpdate, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return LaudoService(db).update(laudo_id, data)


@router.delete("/{laudo_id}")
async def delete_laudo(laudo_id: int, db=Depends(get_db_connection), _=Depends(get_current_user)):
    LaudoService(db).delete(laudo_id)
    return {"detail": "Laudo removido"}


# ── Resultados ────────────────────────────────────────────────────────────────

@router.get("/{laudo_id}/resultados")
async def get_resultados(laudo_id: int, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return LaudoService(db).get_resultados(laudo_id)


@router.post("/{laudo_id}/resultados", status_code=201)
async def add_resultado(laudo_id: int, data: LaudoResultadoCreate, db=Depends(get_db_connection), _=Depends(get_current_user)):
    rid = LaudoService(db).add_resultado(data)
    return {"id": rid}
