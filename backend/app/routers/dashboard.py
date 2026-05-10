from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session
from app.core.deps import get_current_user
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_stats(
    lab_id: int = Query(...),
    db: AsyncSession = Depends(get_db_session),
    user=Depends(get_current_user),
):
    return await DashboardService(db).get_stats(lab_id)


@router.get("/trends")
async def get_trends(
    lab_id: int = Query(...),
    db: AsyncSession = Depends(get_db_session),
    user=Depends(get_current_user),
):
    return await DashboardService(db).get_trends(lab_id)


@router.get("/")
async def get_dashboard(
    lab_id: int = Query(...),
    db: AsyncSession = Depends(get_db_session),
    user=Depends(get_current_user),
):
    return await DashboardService(db).get_dashboard(lab_id)
