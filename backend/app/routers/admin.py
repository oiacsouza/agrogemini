from fastapi import APIRouter, Depends, Query, Request
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session
from app.core.deps import require_role
from app.services.admin_service import AdminService
from app.services.system_checks import run_system_checks

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


@router.get("/openapi")
async def admin_openapi_catalog(
    request: Request,
    user=Depends(require_role("ADM")),
):
    """Return a compact OpenAPI endpoint catalog for the admin API console."""
    schema = request.app.openapi()
    endpoints = []
    for path, methods in schema.get("paths", {}).items():
        for method, spec in methods.items():
            endpoints.append({
                "method": method.upper(),
                "path": path,
                "summary": spec.get("summary") or spec.get("operationId") or "",
                "tags": spec.get("tags", []),
            })
    return {"endpoints": sorted(endpoints, key=lambda item: (item["path"], item["method"]))}


@router.post("/system-checks")
async def admin_system_checks(
    request: Request,
    user=Depends(require_role("ADM")),
):
    """Run static safety checks from the admin panel."""
    return run_system_checks(request.app)
