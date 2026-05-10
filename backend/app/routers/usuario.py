from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session
from app.core.deps import require_role
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from app.services.usuario_service import UsuarioService

router = APIRouter(prefix="/api/v1/usuarios", tags=["Usuarios"])


@router.get("/", response_model=list[UsuarioResponse])
async def list_usuarios(
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("ADM")),
):
    return await UsuarioService(db).get_all()


@router.get("/{id}", response_model=UsuarioResponse)
async def get_usuario(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("ADM")),
):
    return await UsuarioService(db).get_by_id(id)


@router.post("/", response_model=UsuarioResponse)
async def create_usuario(
    data: UsuarioCreate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("ADM")),
):
    return await UsuarioService(db).create(data)


@router.put("/{id}", response_model=UsuarioResponse)
async def update_usuario(
    id: int,
    data: UsuarioUpdate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("ADM")),
):
    return await UsuarioService(db).update(id, data)


@router.delete("/{id}")
async def delete_usuario(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("ADM")),
):
    return await UsuarioService(db).delete(id)
