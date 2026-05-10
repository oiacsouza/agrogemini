from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Numeric, ForeignKey, DateTime, CheckConstraint, UniqueConstraint, Identity

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.fazenda import Fazenda
    from app.models.amostra import Amostra

class Talhao(Base):
    __tablename__ = "talhoes"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    fazenda_id: Mapped[int] = mapped_column(ForeignKey("fazendas.id"), nullable=False)
    identificacao: Mapped[str] = mapped_column(String(100), nullable=False)
    tipo_plantio: Mapped[str] = mapped_column(String(30), nullable=False)
    area: Mapped[Optional[float]] = mapped_column(Numeric(12, 2))
    profundidade_amostragem_cm: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    textura_solo: Mapped[Optional[str]] = mapped_column(String(20))
    bioma: Mapped[Optional[str]] = mapped_column(String(20))
    latitude_centroide: Mapped[Optional[float]] = mapped_column(Numeric(10, 7))
    longitude_centroide: Mapped[Optional[float]] = mapped_column(Numeric(10, 7))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)

    # Relationships
    fazenda: Mapped["Fazenda"] = relationship(back_populates="talhoes")
    amostras: Mapped[list["Amostra"]] = relationship(back_populates="talhao")

    __table_args__ = (
        UniqueConstraint("fazenda_id", "identificacao", name="UQ_TALHOES_FAZENDA_IDENT"),
        CheckConstraint("tipo_plantio IN ('CONVENCIONAL','DIRETO','IRRIGADO','SEQUEIRO','OUTRO')"),
        CheckConstraint("textura_solo IS NULL OR textura_solo IN ('ARENOSA','MEDIA','ARGILOSA','MUITO_ARGILOSA')"),
        CheckConstraint("bioma IS NULL OR bioma IN ('AMAZONIA','CERRADO','CAATINGA','MATA_ATLANTICA','PAMPA','PANTANAL')"),
    )
