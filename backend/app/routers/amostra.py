from fastapi import APIRouter, Depends, Query
from typing import Optional

from app.db.database import get_db_connection
from app.core.deps import get_current_user
from app.schemas.amostra import AmostraCreate, AmostraUpdate
from app.services.amostra_service import AmostraService

router = APIRouter(prefix="/api/v1/amostras", tags=["Amostras"])


@router.get("/")
async def list_amostras(
    lab_id: Optional[int] = Query(None),
    limit: int = Query(100, le=500),
    db=Depends(get_db_connection),
    _=Depends(get_current_user),
):
    return AmostraService(db).get_all(lab_id=lab_id, limit=limit)


@router.get("/cliente/{cliente_id}")
async def list_por_cliente(cliente_id: int, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return AmostraService(db).get_by_cliente(cliente_id)


@router.get("/{amostra_id}")
async def get_amostra(amostra_id: int, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return AmostraService(db).get_by_id(amostra_id)


@router.post("/", status_code=201)
async def create_amostra(data: AmostraCreate, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return AmostraService(db).create(data)


@router.put("/{amostra_id}")
async def update_amostra(amostra_id: int, data: AmostraUpdate, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return AmostraService(db).update(amostra_id, data)


@router.delete("/{amostra_id}")
async def delete_amostra(amostra_id: int, db=Depends(get_db_connection), _=Depends(get_current_user)):
    AmostraService(db).delete(amostra_id)
    return {"detail": "Amostra removida"}
