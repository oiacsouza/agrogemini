from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, DateTime, CheckConstraint, UniqueConstraint, Numeric, Text, Identity

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.laboratorio import Laboratorio
    from app.models.usuario import Usuario
    from app.models.talhao import Talhao

class Importacao(Base):
    __tablename__ = "importacoes"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    laboratorio_id: Mapped[int] = mapped_column(ForeignKey("laboratorios.id"), nullable=False)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    nome_arquivo: Mapped[str] = mapped_column(String(255), nullable=False)
    tipo_arquivo: Mapped[str] = mapped_column(String(10), nullable=False) # CSV, XLSX
    formato_instrumento: Mapped[Optional[str]] = mapped_column(String(40))
    caminho_arquivo: Mapped[str] = mapped_column(Text, nullable=False) # CLOB
    hash_arquivo: Mapped[str] = mapped_column(String(128), nullable=False)
    status: Mapped[str] = mapped_column(String(15), nullable=False) # ENVIADO, PROCESSANDO, PROCESSADO, ERRO
    mensagem_erro: Mapped[Optional[str]] = mapped_column(Text) # CLOB
    total_registros: Mapped[int] = mapped_column(default=0, nullable=False)
    registros_processados: Mapped[int] = mapped_column(default=0, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)
    processado_em: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Relationships
    laboratorio: Mapped["Laboratorio"] = relationship()
    usuario: Mapped["Usuario"] = relationship()
    amostras: Mapped[list["Amostra"]] = relationship(back_populates="importacao")

    __table_args__ = (
        CheckConstraint("tipo_arquivo IN ('CSV','XLSX')"),
        CheckConstraint("status IN ('ENVIADO','PROCESSANDO','PROCESSADO','ERRO')"),
    )

class Amostra(Base):
    __tablename__ = "amostras"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    talhao_id: Mapped[int] = mapped_column(ForeignKey("talhoes.id"), nullable=False)
    cliente_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    laboratorio_id: Mapped[int] = mapped_column(ForeignKey("laboratorios.id"), nullable=False)
    importacao_id: Mapped[Optional[int]] = mapped_column(ForeignKey("importacoes.id"))
    codigo_interno: Mapped[str] = mapped_column(String(50), nullable=False)
    codigo_barras: Mapped[Optional[str]] = mapped_column(String(64))
    tipo_amostra: Mapped[str] = mapped_column(String(20), nullable=False) # SOLO, FERTILIZANTE, FOLHA, SEMENTE, PRAGA
    descricao: Mapped[Optional[str]] = mapped_column(Text) # CLOB
    lote: Mapped[Optional[str]] = mapped_column(String(50))
    tonelada: Mapped[Optional[float]] = mapped_column(Numeric(12, 3))
    metodo_extracao: Mapped[Optional[str]] = mapped_column(String(50))
    data_coleta: Mapped[Optional[datetime]] = mapped_column(DateTime)
    data_entrada: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    data_saida: Mapped[Optional[datetime]] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(20), nullable=False) # RECEBIDA, IMPORTADA, EM_ANALISE, REVISAO, LAUDO_GERADO, ENVIADA, CANCELADA
    prioridade: Mapped[str] = mapped_column(String(10), default="MEDIA", nullable=False) # BAIXA, MEDIA, ALTA, URGENTE
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)

    # Relationships
    talhao: Mapped["Talhao"] = relationship(back_populates="amostras")
    cliente: Mapped["Usuario"] = relationship()
    laboratorio: Mapped["Laboratorio"] = relationship()
    importacao: Mapped[Optional["Importacao"]] = relationship(back_populates="amostras")
    laudo: Mapped[Optional["Laudo"]] = relationship(back_populates="amostra", uselist=False)

    __table_args__ = (
        UniqueConstraint("laboratorio_id", "codigo_interno", name="UQ_AMOSTRAS_COD_INTERNO_LAB"),
        CheckConstraint("tipo_amostra IN ('SOLO','FERTILIZANTE','FOLHA','SEMENTE','PRAGA')"),
        CheckConstraint("status IN ('RECEBIDA','IMPORTADA','EM_ANALISE','REVISAO','LAUDO_GERADO','ENVIADA','CANCELADA')"),
        CheckConstraint("prioridade IN ('BAIXA','MEDIA','ALTA','URGENTE')"),
        CheckConstraint("data_saida IS NULL OR data_saida >= data_entrada"),
    )

class Laudo(Base):
    __tablename__ = "laudos"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    amostra_id: Mapped[int] = mapped_column(ForeignKey("amostras.id"), nullable=False)
    laboratorio_id: Mapped[int] = mapped_column(ForeignKey("laboratorios.id"), nullable=False)
    responsavel_id: Mapped[Optional[int]] = mapped_column(ForeignKey("usuarios.id"))
    tipo_laudo: Mapped[str] = mapped_column(String(20), nullable=False) # SOLO, FERTILIZANTE, FOLHA, SEMENTE, PRAGA
    numero_pedido: Mapped[Optional[str]] = mapped_column(String(50))
    numero_laudo: Mapped[str] = mapped_column(String(50), nullable=False)
    solicitante_nome: Mapped[Optional[str]] = mapped_column(String(200))
    razao_social: Mapped[Optional[str]] = mapped_column(String(200))
    propriedade: Mapped[Optional[str]] = mapped_column(String(200))
    cidade: Mapped[Optional[str]] = mapped_column(String(100))
    data_entrada: Mapped[Optional[datetime]] = mapped_column(DateTime)
    data_saida: Mapped[Optional[datetime]] = mapped_column(DateTime)
    data_emissao: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String(15), nullable=False) # RASCUNHO, EM_REVISAO, APROVADO, EMITIDO, CANCELADO
    pdf_path: Mapped[Optional[str]] = mapped_column(Text) # CLOB
    hash_autenticacao: Mapped[Optional[str]] = mapped_column(String(128))
    observacoes: Mapped[Optional[str]] = mapped_column(Text) # CLOB
    responsavel_tecnico_nome: Mapped[Optional[str]] = mapped_column(String(200))
    responsavel_tecnico_registro: Mapped[Optional[str]] = mapped_column(String(50))
    credenciamento_mapa: Mapped[Optional[str]] = mapped_column(String(30))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)

    # Relationships
    amostra: Mapped["Amostra"] = relationship(back_populates="laudo")
    laboratorio: Mapped["Laboratorio"] = relationship()
    responsavel: Mapped[Optional["Usuario"]] = relationship()
    resultados: Mapped[list["LaudoResultado"]] = relationship(back_populates="laudo", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("laboratorio_id", "numero_laudo", name="UQ_LAUDOS_NUM_LAUDO_LAB"),
        CheckConstraint("tipo_laudo IN ('SOLO','FERTILIZANTE','FOLHA','SEMENTE','PRAGA')"),
        CheckConstraint("status IN ('RASCUNHO','EM_REVISAO','APROVADO','EMITIDO','CANCELADO')"),
    )

class LaudoResultado(Base):
    __tablename__ = "laudo_resultados"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    laudo_id: Mapped[int] = mapped_column(ForeignKey("laudos.id"), nullable=False)
    configuracao_id: Mapped[Optional[int]] = mapped_column(ForeignKey("configuracoes_calculo.id"))
    parametro: Mapped[str] = mapped_column(String(120), nullable=False)
    unidade: Mapped[Optional[str]] = mapped_column(String(30))
    garantia: Mapped[Optional[str]] = mapped_column(String(50))
    resultado: Mapped[Optional[float]] = mapped_column(Numeric(18, 6))
    resultado_convertido: Mapped[Optional[float]] = mapped_column(Numeric(18, 6))
    unidade_convertida: Mapped[Optional[str]] = mapped_column(String(30))
    classe_interpretativa: Mapped[Optional[str]] = mapped_column(String(30))
    ordem_exibicao: Mapped[int] = mapped_column(nullable=False)
    fora_spec: Mapped[str] = mapped_column(String(1), default="N", nullable=False) # CHAR(1)

    # Relationships
    laudo: Mapped["Laudo"] = relationship(back_populates="resultados")
    configuracao: Mapped[Optional["ConfiguracaoCalculo"]] = relationship()

    __table_args__ = (
        CheckConstraint("classe_interpretativa IS NULL OR classe_interpretativa IN ('MUITO_BAIXO','BAIXO','MEDIO','ADEQUADO','ALTO','MUITO_ALTO','FORA_ESPEC')"),
        CheckConstraint("fora_spec IN ('Y','N')"),
    )
