from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Numeric, ForeignKey, DateTime, CheckConstraint, Identity

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.endereco import Endereco
    from app.models.usuario import Usuario
    from app.models.talhao import Talhao

class Fazenda(Base):
    __tablename__ = "fazendas"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    cpf_cnpj: Mapped[str] = mapped_column(String(14), nullable=False)
    endereco_id: Mapped[Optional[int]] = mapped_column(ForeignKey("enderecos.id"))
    car: Mapped[Optional[str]] = mapped_column(String(30))
    area_total_ha: Mapped[Optional[float]] = mapped_column(Numeric(12, 2))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)

    # Relationships
    endereco: Mapped[Optional["Endereco"]] = relationship()
    talhoes: Mapped[list["Talhao"]] = relationship(back_populates="fazenda", cascade="all, delete-orphan")
    vinculos_usuarios: Mapped[list["FazendaUsuario"]] = relationship(back_populates="fazenda", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("REGEXP_LIKE(cpf_cnpj, '^[0-9]{11,14}$')"),
    )

class FazendaUsuario(Base):
    __tablename__ = "fazenda_usuarios"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    fazenda_id: Mapped[int] = mapped_column(ForeignKey("fazendas.id"), nullable=False)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    papel: Mapped[str] = mapped_column(String(20), nullable=False) # DONO, FUNCIONARIO, GERENTE
    inicio_vigencia: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    fim_vigencia: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # Relationships
    fazenda: Mapped["Fazenda"] = relationship(back_populates="vinculos_usuarios")
    usuario: Mapped["Usuario"] = relationship()

    __table_args__ = (
        CheckConstraint("papel IN ('DONO','FUNCIONARIO','GERENTE')"),
        CheckConstraint("fim_vigencia IS NULL OR fim_vigencia >= inicio_vigencia"),
    )
