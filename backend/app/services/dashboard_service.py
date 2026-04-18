import oracledb
from app.repositories.amostra_repository import AmostraRepository
from app.repositories.laudo_repository import LaudoRepository
from app.schemas.dashboard import DashboardStats, DashboardResponse, TrendDataPoint


class DashboardService:
    def __init__(self, db_conn: oracledb.Connection):
        self.amostra_repo = AmostraRepository(db_conn)
        self.laudo_repo = LaudoRepository(db_conn)

    def get_stats(self, lab_id: int) -> DashboardStats:
        total = self.amostra_repo.count_by_lab(lab_id)
        today = self.amostra_repo.count_today(lab_id)
        pending = self.amostra_repo.count_by_status(lab_id, ["RECEBIDA", "IMPORTADA", "EM_ANALISE"])
        laudos = self.laudo_repo.count_by_lab(lab_id)
        return DashboardStats(
            total_amostras=total,
            processadas_hoje=today,
            pendentes=pending,
            laudos_emitidos=laudos,
        )

    def get_trends(self, lab_id: int) -> list[TrendDataPoint]:
        rows = self.amostra_repo.monthly_trend(lab_id, months=6)
        return [
            TrendDataPoint(month=r["month"], samples=r["samples"], health=0)
            for r in rows
        ]

    def get_dashboard(self, lab_id: int) -> DashboardResponse:
        return DashboardResponse(
            stats=self.get_stats(lab_id),
            trends=self.get_trends(lab_id),
        )
