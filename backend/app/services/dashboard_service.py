from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.amostra_repository import AmostraRepository
from app.repositories.laudo_repository import LaudoRepository
from app.schemas.dashboard import DashboardStats, DashboardResponse, TrendDataPoint


class DashboardService:
    def __init__(self, db_session: AsyncSession):
        self.session = db_session
        self.amostra_repo = AmostraRepository(db_session)
        self.laudo_repo = LaudoRepository(db_session)

    async def get_stats(self, lab_ids: set[int]) -> DashboardStats:
        total = await self.amostra_repo.count_by_labs(lab_ids)
        today = await self.amostra_repo.count_today_by_labs(lab_ids)
        pending = await self.amostra_repo.count_by_status_for_labs(lab_ids, ["RECEBIDA", "IMPORTADA", "EM_ANALISE"])
        laudos = await self.laudo_repo.count_by_labs(lab_ids)
        return DashboardStats(
            total_amostras=total,
            processadas_hoje=today,
            pendentes=pending,
            laudos_emitidos=laudos,
        )

    async def get_trends(self, lab_ids: set[int]) -> list[TrendDataPoint]:
        rows = await self.amostra_repo.monthly_trend_for_labs(lab_ids, months=6)
        return [
            TrendDataPoint(month=r["month"], samples=r["samples"], health=0)
            for r in rows
        ]

    async def get_dashboard(self, lab_ids: set[int]) -> DashboardResponse:
        stats = await self.get_stats(lab_ids)
        trends = await self.get_trends(lab_ids)
        return DashboardResponse(
            stats=stats,
            trends=trends,
        )
