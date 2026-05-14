from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, DateTime, CHAR, CheckConstraint, UniqueConstraint, Identity

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.endereco import Endereco
    from app.models.usuario import Usuario

class Laboratorio(Base):
    __tablename__ = "laboratorios"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    cnpj: Mapped[str] = mapped_column(String(14), unique=True, nullable=False)
    endereco_id: Mapped[Optional[int]] = mapped_column(ForeignKey("enderecos.id"))
    email: Mapped[str] = mapped_column(String(254), unique=True, nullable=False)
    ativo: Mapped[str] = mapped_column(CHAR(1), default="Y", nullable=False)
    acreditacao_iso17025: Mapped[str] = mapped_column(CHAR(1), default="N", nullable=False)
    registro_renasem: Mapped[Optional[str]] = mapped_column(String(30))
    credenciamento_mapa: Mapped[Optional[str]] = mapped_column(String(30))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)

    # Relationships
    endereco: Mapped[Optional["Endereco"]] = relationship()
    telefones: Mapped[list["TelefoneLaboratorio"]] = relationship(back_populates="laboratorio", cascade="all, delete-orphan")
    equipe: Mapped[list["LaboratorioUsuario"]] = relationship(back_populates="laboratorio", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("REGEXP_LIKE(cnpj, '^[0-9]{14}$')"),
        CheckConstraint("ativo IN ('Y','N')"),
        CheckConstraint("acreditacao_iso17025 IN ('Y','N')"),
    )

class LaboratorioUsuario(Base):
    __tablename__ = "laboratorio_usuarios"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    laboratorio_id: Mapped[int] = mapped_column(ForeignKey("laboratorios.id"), nullable=False)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    papel: Mapped[str] = mapped_column(String(25), nullable=False) # TECNICO, GESTOR, RESPONSAVEL_TECNICO, ADMINISTRADOR, CLIENTE
    registro_crea: Mapped[Optional[str]] = mapped_column(String(30))

    # Relationships
    laboratorio: Mapped["Laboratorio"] = relationship(back_populates="equipe")
    usuario: Mapped["Usuario"] = relationship()

    __table_args__ = (
        UniqueConstraint("laboratorio_id", "usuario_id", "papel"),
        CheckConstraint(
            "papel IN ('TECNICO','GESTOR','RESPONSAVEL_TECNICO','ADMINISTRADOR','CLIENTE')",
            name="CK_LAB_USUARIOS_PAPEL",
        ),
    )

class TelefoneLaboratorio(Base):
    __tablename__ = "telefones_laboratorios"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    laboratorio_id: Mapped[int] = mapped_column(ForeignKey("laboratorios.id"), nullable=False)
    numero: Mapped[str] = mapped_column(String(20), nullable=False)
    tipo: Mapped[str] = mapped_column(String(15), nullable=False) # MOVEL, FIXO, COMERCIAL

    # Relationships
    laboratorio: Mapped["Laboratorio"] = relationship(back_populates="telefones")

    __table_args__ = (
        CheckConstraint("tipo IN ('MOVEL','FIXO','COMERCIAL')"),
    )
