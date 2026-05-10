from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session
from app.core.deps import require_role
from app.services.admin_service import AdminService

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


@router.get("/dashboard")
async def admin_dashboard(
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("ADM")),
):
    """Global admin dashboard with system-wide statistics."""
    return await AdminService(db).get_dashboard()


@router.get("/usuarios")
async def admin_list_usuarios(
    tipo: Optional[str] = Query(None, description="Filter by tipo_usuario"),
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("ADM")),
):
    """List all users with plan info."""
    return await AdminService(db).get_all_users(tipo=tipo)


@router.get("/laboratorios")
async def admin_list_laboratorios(
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("ADM")),
):
    """List all labs with subscription details."""
    return await AdminService(db).get_all_labs()


@router.get("/produtores")
async def admin_list_produtores(
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("ADM")),
):
    """List all producers with their plan status."""
    return await AdminService(db).get_all_producers()
