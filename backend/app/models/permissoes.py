from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, DateTime, Identity, CheckConstraint

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.usuario import Usuario

class PermissaoSistema(Base):
    __tablename__ = "permissoes_sistema"

    codigo: Mapped[str] = mapped_column(String(50), primary_key=True) # Ex: 'LAUDO_EDITAR'
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    modulo: Mapped[str] = mapped_column(String(50), nullable=False) # Ex: 'OPERACIONAL', 'FINANCEIRO'
    descricao: Mapped[str] = mapped_column(String(255), nullable=True)

    # Relationships
    vinculos_usuarios: Mapped[list["UsuarioPermissao"]] = relationship(back_populates="permissao", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"Permissao(codigo={self.codigo}, modulo={self.modulo})"

class UsuarioPermissao(Base):
    __tablename__ = "usuario_permissoes"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    permissao_codigo: Mapped[str] = mapped_column(ForeignKey("permissoes_sistema.codigo"), nullable=False)
    estado: Mapped[str] = mapped_column(String(10), nullable=False) # 'CONCEDIDA', 'NEGADA'
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)

    # Relationships
    usuario: Mapped["Usuario"] = relationship(back_populates="permissoes_granulares")
    permissao: Mapped["PermissaoSistema"] = relationship(back_populates="vinculos_usuarios")

    __table_args__ = (
        CheckConstraint("estado IN ('CONCEDIDA', 'NEGADA')"),
    )

    def __repr__(self) -> str:
        return f"UsuarioPermissao(user={self.usuario_id}, code={self.permissao_codigo}, state={self.estado})"
