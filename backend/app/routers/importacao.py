from fastapi import APIRouter, Depends, Query
from typing import Optional

from app.db.database import get_db_connection
from app.core.deps import get_current_user
from app.schemas.importacao import ImportacaoCreate, ImportacaoUpdate
from app.services.importacao_service import ImportacaoService

router = APIRouter(prefix="/api/v1/importacoes", tags=["Importações"])


@router.get("/")
async def list_importacoes(
    lab_id: Optional[int] = Query(None),
    limit: int = Query(100, le=500),
    db=Depends(get_db_connection),
    _=Depends(get_current_user),
):
    return ImportacaoService(db).get_all(lab_id=lab_id, limit=limit)


@router.get("/{importacao_id}")
async def get_importacao(importacao_id: int, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return ImportacaoService(db).get_by_id(importacao_id)


@router.post("/", status_code=201)
async def create_importacao(data: ImportacaoCreate, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return ImportacaoService(db).create(data)


@router.put("/{importacao_id}")
async def update_importacao(importacao_id: int, data: ImportacaoUpdate, db=Depends(get_db_connection), _=Depends(get_current_user)):
    return ImportacaoService(db).update(importacao_id, data)


@router.delete("/{importacao_id}")
async def delete_importacao(importacao_id: int, db=Depends(get_db_connection), _=Depends(get_current_user)):
    ImportacaoService(db).delete(importacao_id)
    return {"detail": "Importação removida"}
