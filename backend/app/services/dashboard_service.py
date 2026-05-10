from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.amostra_repository import AmostraRepository
from app.repositories.laudo_repository import LaudoRepository
from app.schemas.dashboard import DashboardStats, DashboardResponse, TrendDataPoint


class DashboardService:
    def __init__(self, db_session: AsyncSession):
        self.session = db_session
        self.amostra_repo = AmostraRepository(db_session)
        self.laudo_repo = LaudoRepository(db_session)

    async def get_stats(self, lab_id: int) -> DashboardStats:
        total = await self.amostra_repo.count_by_lab(lab_id)
        today = await self.amostra_repo.count_today(lab_id)
        pending = await self.amostra_repo.count_by_status(lab_id, ["RECEBIDA", "IMPORTADA", "EM_ANALISE"])
        laudos = await self.laudo_repo.count_by_lab(lab_id)
        return DashboardStats(
            total_amostras=total,
            processadas_hoje=today,
            pendentes=pending,
            laudos_emitidos=laudos,
        )

    async def get_trends(self, lab_id: int) -> list[TrendDataPoint]:
        rows = await self.amostra_repo.monthly_trend(lab_id, months=6)
        return [
            TrendDataPoint(month=r["month"], samples=r["samples"], health=0)
            for r in rows
        ]

    async def get_dashboard(self, lab_id: int) -> DashboardResponse:
        stats = await self.get_stats(lab_id)
        trends = await self.get_trends(lab_id)
        return DashboardResponse(
            stats=stats,
            trends=trends,
        )
