from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_amostras: int = 0
    processadas_hoje: int = 0
    pendentes: int = 0
    laudos_emitidos: int = 0


class TrendDataPoint(BaseModel):
    month: str
    samples: int
    health: float


class DashboardResponse(BaseModel):
    stats: DashboardStats
    trends: list[TrendDataPoint] = []
