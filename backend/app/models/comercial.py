from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Numeric, ForeignKey, DateTime, CHAR, CheckConstraint, Text, Identity

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.laboratorio import Laboratorio

class PlanoAssinatura(Base):
    __tablename__ = "planos_assinaturas"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    tipo: Mapped[str] = mapped_column(String(20), unique=True, nullable=False) # BASICO, PREMIUM
    valor: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    descricao: Mapped[Optional[str]] = mapped_column(Text) # Maps to CLOB in Oracle
    limite_amostras: Mapped[int] = mapped_column(nullable=False)
    limite_usuarios: Mapped[int] = mapped_column(nullable=False)
    permite_api: Mapped[str] = mapped_column(CHAR(1), default="N", nullable=False)
    ativo: Mapped[str] = mapped_column(CHAR(1), default="Y", nullable=False)

    __table_args__ = (
        CheckConstraint("tipo IN ('BASICO','PREMIUM')"),
        CheckConstraint("permite_api IN ('Y','N')"),
        CheckConstraint("ativo IN ('Y','N')"),
    )

class Assinatura(Base):
    __tablename__ = "assinaturas"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    laboratorio_id: Mapped[int] = mapped_column(ForeignKey("laboratorios.id"), nullable=False)
    plano_id: Mapped[int] = mapped_column(ForeignKey("planos_assinaturas.id"), nullable=False)
    numero_contrato: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    arquivo_contrato: Mapped[Optional[str]] = mapped_column(Text) # CLOB
    data_inicio: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    data_expiracao: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String(15), nullable=False) # ATIVA, SUSPENSA, CANCELADA, EXPIRADA
    renovacao_automatica: Mapped[str] = mapped_column(CHAR(1), default="N", nullable=False)
    amostras_consumidas: Mapped[int] = mapped_column(default=0, nullable=False)

    # Relationships
    laboratorio: Mapped["Laboratorio"] = relationship()
    plano: Mapped["PlanoAssinatura"] = relationship()

    __table_args__ = (
        CheckConstraint("status IN ('ATIVA','SUSPENSA','CANCELADA','EXPIRADA')"),
        CheckConstraint("renovacao_automatica IN ('Y','N')"),
        CheckConstraint("data_expiracao >= data_inicio"),
    )
