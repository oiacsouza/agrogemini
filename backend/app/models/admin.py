from datetime import datetime, date
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Numeric, DateTime, Date, Identity, String

from app.models.base import Base

class AdminMetricaConsolidada(Base):
    __tablename__ = "admin_metricas_consolidadas"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    data_referencia: Mapped[date] = mapped_column(Date, nullable=False, unique=True)
    assinantes_ativos: Mapped[int] = mapped_column(default=0, nullable=False)
    novas_assinaturas_mes: Mapped[int] = mapped_column(default=0, nullable=False)
    cancelamentos_mes: Mapped[int] = mapped_column(default=0, nullable=False)
    renovacoes_mes: Mapped[int] = mapped_column(default=0, nullable=False)
    retornantes_mes: Mapped[int] = mapped_column(default=0, nullable=False)
    mrr_estimado: Mapped[float] = mapped_column(Numeric(14, 2), default=0.0, nullable=False)
    total_amostras_mes: Mapped[int] = mapped_column(default=0, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)

    def __repr__(self) -> str:
        return f"AdminMetrica(ref={self.data_referencia}, MRR={self.mrr_estimado})"

class FaturamentoHistorico(Base):
    __tablename__ = "faturamento_historico"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    ano_mes: Mapped[str] = mapped_column(String(7), nullable=False, unique=True)
    receita_mensal: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    receita_esperada: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    crescimento_percentual: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)

    def __repr__(self) -> str:
        return f"FaturamentoHistorico(ano_mes={self.ano_mes}, receita={self.receita_mensal})"
