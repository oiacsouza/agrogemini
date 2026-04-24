from fastapi import APIRouter, Depends, HTTPException

from app.db.database import get_db_connection
from app.core.deps import get_current_user, require_role
from app.schemas.laboratorio import LaboratorioCreate, LaboratorioUpdate, LabUsuarioCreate
from app.services.laboratorio_service import LaboratorioService

router = APIRouter(prefix="/api/v1/laboratorios", tags=["Laboratórios"])


@router.get("/")
async def list_laboratorios(
    db=Depends(get_db_connection),
    user=Depends(get_current_user),
):
    # Only admin sees all labs; lab users see only their own
    if user["tipo_usuario"] == "ADM":
        return LaboratorioService(db).get_with_stats()
    # Producers and lab users see only labs linked to them
    return LaboratorioService(db).get_by_user(user["id"])


@router.get("/me")
async def my_labs(db=Depends(get_db_connection), user=Depends(get_current_user)):
    """Get labs the authenticated user belongs to."""
    return LaboratorioService(db).get_by_user(user["id"])


@router.get("/{lab_id}")
async def get_laboratorio(lab_id: int, db=Depends(get_db_connection), user=Depends(get_current_user)):
    return LaboratorioService(db).get_by_id(lab_id)


@router.post("/", status_code=201)
async def create_laboratorio(
    data: LaboratorioCreate,
    db=Depends(get_db_connection),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    return LaboratorioService(db).create(data)


@router.put("/{lab_id}")
async def update_laboratorio(
    lab_id: int,
    data: LaboratorioUpdate,
    db=Depends(get_db_connection),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    return LaboratorioService(db).update(lab_id, data)


@router.delete("/{lab_id}")
async def delete_laboratorio(
    lab_id: int,
    db=Depends(get_db_connection),
    user=Depends(require_role("ADM")),
):
    LaboratorioService(db).delete(lab_id)
    return {"detail": "Laboratório removido"}


# ── Lab Users (Employees) ────────────────────────────────────────────────────

@router.get("/{lab_id}/usuarios")
async def list_lab_usuarios(
    lab_id: int,
    db=Depends(get_db_connection),
    user=Depends(get_current_user),
):
    return LaboratorioService(db).get_usuarios(lab_id)


@router.post("/{lab_id}/usuarios", status_code=201)
async def add_lab_usuario(
    lab_id: int,
    data: LabUsuarioCreate,
    db=Depends(get_db_connection),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    assoc_id = LaboratorioService(db).add_usuario(lab_id, data.usuario_id, data.papel, data.registro_crea)
    return {"id": assoc_id}


@router.delete("/{lab_id}/usuarios/{assoc_id}")
async def remove_lab_usuario(
    lab_id: int,
    assoc_id: int,
    db=Depends(get_db_connection),
    user=Depends(require_role("UP", "ADM")),
):
    LaboratorioService(db).remove_usuario(assoc_id)
    return {"detail": "Associação removida"}


# ── Lab Phones ────────────────────────────────────────────────────────────────

@router.get("/{lab_id}/telefones")
async def list_lab_telefones(
    lab_id: int,
    db=Depends(get_db_connection),
    user=Depends(get_current_user),
):
    return LaboratorioService(db).get_telefones(lab_id)


@router.post("/{lab_id}/telefones", status_code=201)
async def add_lab_telefone(
    lab_id: int,
    numero: str,
    tipo: str = "COMERCIAL",
    db=Depends(get_db_connection),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    tid = LaboratorioService(db).add_telefone(lab_id, numero, tipo)
    return {"id": tid}
