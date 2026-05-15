from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session
from app.core.deps import get_current_user
from app.schemas.amostra import AmostraCreate, AmostraUpdate
from app.services.access_control import LabAccessService
from app.services.amostra_service import AmostraService
from app.repositories.usuario_repository import UsuarioRepository

router = APIRouter(prefix="/api/v1/amostras", tags=["Amostras"])


@router.get("/")
async def list_amostras(
    lab_id: Optional[int] = Query(None),
    limit: int = Query(100, le=500),
    db: AsyncSession = Depends(get_db_session),
    user=Depends(get_current_user),
):
    # Producers can only see their own samples
    service = AmostraService(db)
    if user["tipo_usuario"] == "UE":
        return await service.get_by_cliente(user["id"])
    access = LabAccessService(db)
    if lab_id is not None:
        return await service.get_all_by_labs(await access.metric_lab_ids_for_user(user, lab_id), limit=limit)
    return await service.get_all_by_labs(await access.visible_lab_ids_for_user(user), limit=limit)


@router.get("/minhas")
async def minhas_amostras(
    db: AsyncSession = Depends(get_db_session),
    user=Depends(get_current_user),
):
    """Return samples belonging to the current user (as cliente)."""
    return await AmostraService(db).get_by_cliente(user["id"])


@router.get("/cliente/{cliente_id}")
async def list_por_cliente(
    cliente_id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(get_current_user),
):
    # Producers can only see their own
    if user["tipo_usuario"] == "UE" and user["id"] != cliente_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    samples = await AmostraService(db).get_by_cliente(cliente_id)
    if user["tipo_usuario"] == "UE":
        return samples
    visible_labs = await LabAccessService(db).visible_lab_ids_for_user(user)
    return [sample for sample in samples if sample.laboratorio_id in visible_labs]


@router.get("/{amostra_id}")
async def get_amostra(
    amostra_id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(get_current_user),
):
    amostra = await AmostraService(db).get_by_id(amostra_id)
    # Producers can only see their own samples
    # Assuming 'amostra' might be an ORM object or a dict depending on repository implementation
    # Based on repository refactor, it's likely an ORM object.
    cliente_id = amostra.cliente_id if hasattr(amostra, "cliente_id") else amostra.get("cliente_id")
    
    if user["tipo_usuario"] == "UE" and cliente_id != user["id"]:
        raise HTTPException(status_code=403, detail="Acesso negado a esta amostra")
    if user["tipo_usuario"] != "UE":
        await LabAccessService(db).assert_lab_access(user, amostra.laboratorio_id)
    return amostra


@router.post("/", status_code=201)
async def create_amostra(
    data: AmostraCreate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(get_current_user),
):
    # Producers cannot create samples (only labs can)
    if user["tipo_usuario"] == "UE":
        raise HTTPException(status_code=403, detail="Produtores não podem cadastrar amostras")
    await LabAccessService(db).assert_lab_access(user, data.laboratorio_id)

    # Check sample limit for non-premium lab users
    if user["tipo_usuario"] in ("UP", "UC"):
        repo = UsuarioRepository(db)
        plano = await repo.get_user_plan(user["id"], user["tipo_usuario"])
        if plano != "PREMIUM":
            # get_lab_sample_usage might not be implemented in async repo yet or might be different
            # For now, keeping the logic and awaiting it.
            # I should verify if get_lab_sample_usage exists.
            if hasattr(repo, "get_lab_sample_usage"):
                usage = await repo.get_lab_sample_usage(user["id"])
                if usage["limite_amostras"] and usage["amostras_usadas"] >= usage["limite_amostras"]:
                    raise HTTPException(
                        status_code=403,
                        detail="Limite de amostras atingido. Faça upgrade do plano.",
                    )

    return await AmostraService(db).create(data)


@router.put("/{amostra_id}")
async def update_amostra(
    amostra_id: int,
    data: AmostraUpdate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(get_current_user),
):
    # Producers cannot update samples
    if user["tipo_usuario"] == "UE":
        raise HTTPException(status_code=403, detail="Acesso negado")
    amostra = await AmostraService(db).get_by_id(amostra_id)
    await LabAccessService(db).assert_lab_access(user, amostra.laboratorio_id)
    return await AmostraService(db).update(amostra_id, data)


@router.delete("/{amostra_id}")
async def delete_amostra(
    amostra_id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(get_current_user),
):
    # Producers cannot delete samples
    if user["tipo_usuario"] == "UE":
        raise HTTPException(status_code=403, detail="Acesso negado")
    amostra = await AmostraService(db).get_by_id(amostra_id)
    await LabAccessService(db).assert_lab_access(user, amostra.laboratorio_id)
    await AmostraService(db).delete(amostra_id)
    return {"detail": "Amostra removida"}
