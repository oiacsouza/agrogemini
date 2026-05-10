from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, DateTime, CheckConstraint, CHAR, Text, Identity

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.usuario import Usuario
    from app.models.laboratorio import Laboratorio

class EventoAuditoria(Base):
    __tablename__ = "eventos_auditoria"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    usuario_id: Mapped[Optional[int]] = mapped_column(ForeignKey("usuarios.id"))
    laboratorio_id: Mapped[Optional[int]] = mapped_column(ForeignKey("laboratorios.id"))
    tabela_afetada: Mapped[str] = mapped_column(String(60), nullable=False)
    registro_id: Mapped[int] = mapped_column(nullable=False)
    operacao: Mapped[str] = mapped_column(String(10), nullable=False) # INSERT, UPDATE, DELETE, LOGIN, DOWNLOAD
    dados_anteriores: Mapped[Optional[str]] = mapped_column(Text) # CLOB (JSON)
    dados_novos: Mapped[Optional[str]] = mapped_column(Text) # CLOB (JSON)
    ip_origem: Mapped[Optional[str]] = mapped_column(String(45))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)

    # Relationships
    usuario: Mapped[Optional["Usuario"]] = relationship()
    laboratorio: Mapped[Optional["Laboratorio"]] = relationship()

    __table_args__ = (
        CheckConstraint("operacao IN ('INSERT','UPDATE','DELETE','LOGIN','DOWNLOAD')"),
    )

class Arquivo(Base):
    __tablename__ = "arquivos"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    laboratorio_id: Mapped[int] = mapped_column(ForeignKey("laboratorios.id"), nullable=False)
    amostra_id: Mapped[Optional[int]] = mapped_column(ForeignKey("amostras.id"))
    laudo_id: Mapped[Optional[int]] = mapped_column(ForeignKey("laudos.id"))
    importacao_id: Mapped[Optional[int]] = mapped_column(ForeignKey("importacoes.id"))
    tipo_arquivo: Mapped[str] = mapped_column(String(20), nullable=False) # BRUTO, PREVIEW, PDF_FINAL, CONTRATO, ANEXO
    nome_original: Mapped[str] = mapped_column(String(255), nullable=False)
    caminho_arquivo: Mapped[str] = mapped_column(Text, nullable=False) # CLOB
    extensao: Mapped[str] = mapped_column(String(10), nullable=False)
    tamanho: Mapped[int] = mapped_column(nullable=False)
    hash_md5: Mapped[Optional[str]] = mapped_column(String(32))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)

    # Relationships
    laboratorio: Mapped["Laboratorio"] = relationship()

    __table_args__ = (
        CheckConstraint("tipo_arquivo IN ('BRUTO','PREVIEW','PDF_FINAL','CONTRATO','ANEXO')"),
    )
