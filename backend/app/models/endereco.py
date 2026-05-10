from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Numeric, Identity

from app.models.base import Base

class Endereco(Base):
    __tablename__ = "enderecos"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    cep: Mapped[str] = mapped_column(String(8), nullable=False)
    logradouro: Mapped[str] = mapped_column(String(150), nullable=False)
    numero: Mapped[str] = mapped_column(String(20), nullable=False)
    complemento: Mapped[Optional[str]] = mapped_column(String(100))
    bairro: Mapped[str] = mapped_column(String(100), nullable=False)
    cidade: Mapped[str] = mapped_column(String(100), nullable=False)
    estado: Mapped[str] = mapped_column(String(2), nullable=False)
    latitude: Mapped[Optional[float]] = mapped_column(Numeric(10, 7))
    longitude: Mapped[Optional[float]] = mapped_column(Numeric(10, 7))
    pais: Mapped[str] = mapped_column(String(60), default="Brasil", nullable=False)

    # Relationships
    usuarios: Mapped[list["Usuario"]] = relationship(back_populates="endereco")

    def __repr__(self) -> str:
        return f"Endereco(id={self.id}, cidade={self.cidade}, estado={self.estado})"
