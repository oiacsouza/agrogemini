from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_token
from app.db.database import get_db_session
from app.repositories.usuario_repository import UsuarioRepository

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db=Depends(get_db_session),
):
    """Extract and validate the current user from the JWT bearer token."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação não fornecido",
        )

    payload = decode_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
        )

    user_id: int | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
        )

    repo = UsuarioRepository(db)
    user = await repo.get_by_id(int(user_id))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado",
        )

    # Convert to dict for compatibility with current code
    return {
        "id": user.id,
        "nome": user.nome,
        "sobrenome": user.sobrenome,
        "email": user.email,
        "tipo_usuario": user.tipo_usuario,
        "ativo": user.ativo,
        "plano_ativo": user.plano_ativo
    }


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db=Depends(get_db_session),
):
    """Same as get_current_user but returns None instead of raising."""
    if credentials is None:
        return None
    payload = decode_token(credentials.credentials)
    if payload is None:
        return None
    user_id = payload.get("sub")
    if user_id is None:
        return None
    repo = UsuarioRepository(db)
    user = await repo.get_by_id(int(user_id))
    if user is None:
        return None
    
    return {
        "id": user.id,
        "nome": user.nome,
        "sobrenome": user.sobrenome,
        "email": user.email,
        "tipo_usuario": user.tipo_usuario,
        "ativo": user.ativo,
        "plano_ativo": user.plano_ativo
    }


# ── Role-based access control dependencies ───────────────────────────────────

def require_role(*allowed_roles: str) -> Callable:
    """
    FastAPI dependency factory that restricts access to specific user roles.

    Usage:
        @router.get("/admin-only")
        async def admin_view(user=Depends(require_role("ADM"))):
            ...
    """

    async def _checker(
        current_user=Depends(get_current_user),
    ):
        if current_user["tipo_usuario"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado para este perfil de usuário",
            )
        return current_user

    return _checker


# Convenience shortcuts
require_admin = require_role("ADM")
require_lab_user = require_role("UP", "UC", "ADM")
require_producer = require_role("UE", "ADM")
require_any_authenticated = require_role("UE", "UP", "UC", "ADM")
