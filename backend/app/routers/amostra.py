from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional

from app.db.database import get_db_connection
from app.core.deps import get_current_user
from app.schemas.amostra import AmostraCreate, AmostraUpdate
from app.services.amostra_service import AmostraService
from app.repositories.usuario_repository import UsuarioRepository

router = APIRouter(prefix="/api/v1/amostras", tags=["Amostras"])


@router.get("/")
async def list_amostras(
    lab_id: Optional[int] = Query(None),
    limit: int = Query(100, le=500),
    db=Depends(get_db_connection),
    user=Depends(get_current_user),
):
    # Producers can only see their own samples
    if user["tipo_usuario"] == "UE":
        return AmostraService(db).get_by_cliente(user["id"])
    return AmostraService(db).get_all(lab_id=lab_id, limit=limit)


@router.get("/minhas")
async def minhas_amostras(
    db=Depends(get_db_connection),
    user=Depends(get_current_user),
):
    """Return samples belonging to the current user (as cliente)."""
    return AmostraService(db).get_by_cliente(user["id"])


@router.get("/cliente/{cliente_id}")
async def list_por_cliente(
    cliente_id: int,
    db=Depends(get_db_connection),
    user=Depends(get_current_user),
):
    # Producers can only see their own
    if user["tipo_usuario"] == "UE" and user["id"] != cliente_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return AmostraService(db).get_by_cliente(cliente_id)


@router.get("/{amostra_id}")
async def get_amostra(
    amostra_id: int,
    db=Depends(get_db_connection),
    user=Depends(get_current_user),
):
    amostra = AmostraService(db).get_by_id(amostra_id)
    # Producers can only see their own samples
    if user["tipo_usuario"] == "UE" and amostra.get("cliente_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Acesso negado a esta amostra")
    return amostra


@router.post("/", status_code=201)
async def create_amostra(
    data: AmostraCreate,
    db=Depends(get_db_connection),
    user=Depends(get_current_user),
):
    # Producers cannot create samples (only labs can)
    if user["tipo_usuario"] == "UE":
        raise HTTPException(status_code=403, detail="Produtores não podem cadastrar amostras")

    # Check sample limit for non-premium lab users
    if user["tipo_usuario"] in ("UP", "UC"):
        repo = UsuarioRepository(db)
        plano = repo.get_user_plan(user["id"], user["tipo_usuario"])
        if plano != "PREMIUM":
            usage = repo.get_lab_sample_usage(user["id"])
            if usage["limite_amostras"] and usage["amostras_usadas"] >= usage["limite_amostras"]:
                raise HTTPException(
                    status_code=403,
                    detail="Limite de amostras atingido. Faça upgrade do plano.",
                )

    return AmostraService(db).create(data)


@router.put("/{amostra_id}")
async def update_amostra(
    amostra_id: int,
    data: AmostraUpdate,
    db=Depends(get_db_connection),
    user=Depends(get_current_user),
):
    # Producers cannot update samples
    if user["tipo_usuario"] == "UE":
        raise HTTPException(status_code=403, detail="Acesso negado")
    return AmostraService(db).update(amostra_id, data)


@router.delete("/{amostra_id}")
async def delete_amostra(
    amostra_id: int,
    db=Depends(get_db_connection),
    user=Depends(get_current_user),
):
    # Producers cannot delete samples
    if user["tipo_usuario"] == "UE":
        raise HTTPException(status_code=403, detail="Acesso negado")
    AmostraService(db).delete(amostra_id)
    return {"detail": "Amostra removida"}
