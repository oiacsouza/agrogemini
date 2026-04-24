from fastapi import APIRouter, Depends
from typing import List
import oracledb
from app.db.database import get_db_connection
from app.core.deps import get_current_user, require_role
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from app.services.usuario_service import UsuarioService

router = APIRouter(prefix="/api/v1/usuarios", tags=["Usuários"])

def get_usuario_service(db: oracledb.Connection = Depends(get_db_connection)):
    return UsuarioService(db)


@router.get("/", response_model=List[UsuarioResponse])
def get_usuarios(
    service: UsuarioService = Depends(get_usuario_service),
    user=Depends(require_role("ADM")),
):
    """List all users — Admin only."""
    return service.get_usuarios()


@router.get("/{user_id}", response_model=UsuarioResponse)
def get_usuario(
    user_id: int,
    service: UsuarioService = Depends(get_usuario_service),
    user=Depends(get_current_user),
):
    # Non-admins can only view themselves
    if user["tipo_usuario"] != "ADM" and user["id"] != user_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Acesso negado")
    return service.get_usuario_by_id(user_id)


@router.post("/", response_model=UsuarioResponse, status_code=201)
def create_usuario(
    user_data: UsuarioCreate,
    service: UsuarioService = Depends(get_usuario_service),
    user=Depends(require_role("ADM")),
):
    """Create a user — Admin only."""
    return service.create_usuario(user_data)


@router.put("/{user_id}", response_model=UsuarioResponse)
def update_usuario(
    user_id: int,
    user_data: UsuarioUpdate,
    service: UsuarioService = Depends(get_usuario_service),
    user=Depends(get_current_user),
):
    # Non-admins can only update themselves
    if user["tipo_usuario"] != "ADM" and user["id"] != user_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Acesso negado")
    return service.update_usuario(user_id, user_data)


@router.delete("/{user_id}", status_code=204)
def delete_usuario(
    user_id: int,
    service: UsuarioService = Depends(get_usuario_service),
    user=Depends(require_role("ADM")),
):
    """Delete a user — Admin only."""
    service.delete_usuario(user_id)
    return None
