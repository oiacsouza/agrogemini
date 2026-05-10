from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, DateTime, CHAR, Identity

from app.models.base import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    sobrenome: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(254), unique=True, nullable=False)
    senha_hash: Mapped[str] = mapped_column(String(100), nullable=False)
    tipo_usuario: Mapped[str] = mapped_column(String(3), nullable=False)
    endereco_id: Mapped[Optional[int]] = mapped_column(ForeignKey("enderecos.id"))
    ativo: Mapped[str] = mapped_column(CHAR(1), default="Y", nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)
    ultimo_acesso: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    plano_ativo: Mapped[str] = mapped_column(String(10), default="FREE")

    # Relationships - Pure string references
    endereco = relationship("Endereco", back_populates="usuarios")
    telefones = relationship("TelefoneUsuario", back_populates="usuario", cascade="all, delete-orphan")
    permissoes_granulares = relationship("UsuarioPermissao", back_populates="usuario", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"Usuario(id={self.id}, email={self.email}, tipo={self.tipo_usuario})"

class TelefoneUsuario(Base):
    __tablename__ = "telefones_usuarios"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    numero: Mapped[str] = mapped_column(String(20), nullable=False)
    tipo: Mapped[str] = mapped_column(String(15), nullable=False) # MOVEL, FIXO, COMERCIAL
    whatsapp: Mapped[str] = mapped_column(CHAR(1), default="N", nullable=False)

    # Relationships
    usuario = relationship("Usuario", back_populates="telefones")

    def __repr__(self) -> str:
        return f"TelefoneUsuario(id={self.id}, numero={self.numero})"
