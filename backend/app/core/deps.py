from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_token
from app.db.database import get_db_connection
from app.repositories.usuario_repository import UsuarioRepository

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db=Depends(get_db_connection),
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
    user = repo.get_by_id(int(user_id))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado",
        )

    return user


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db=Depends(get_db_connection),
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
    return repo.get_by_id(int(user_id))
