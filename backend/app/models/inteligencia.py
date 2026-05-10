from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, DateTime, CheckConstraint, UniqueConstraint, Numeric, CHAR, Text, Identity

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.laboratorio import Laboratorio

class ConfiguracaoCalculo(Base):
    __tablename__ = "configuracoes_calculo"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    laboratorio_id: Mapped[Optional[int]] = mapped_column(ForeignKey("laboratorios.id"))
    tipo_laudo: Mapped[str] = mapped_column(String(20), nullable=False) # SOLO, FERTILIZANTE, FOLHA, SEMENTE, PRAGA
    descricao: Mapped[str] = mapped_column(String(200), nullable=False)
    elemento: Mapped[str] = mapped_column(String(100), nullable=False)
    formula_matematica: Mapped[str] = mapped_column(Text, nullable=False) # CLOB
    unidade_resultado: Mapped[Optional[str]] = mapped_column(String(30))
    ativo: Mapped[str] = mapped_column(CHAR(1), default="Y", nullable=False)
    versao: Mapped[float] = mapped_column(Numeric(6, 2), nullable=False)
    ordem_execucao: Mapped[int] = mapped_column(nullable=False)
    substituido_por: Mapped[Optional[int]] = mapped_column(ForeignKey("configuracoes_calculo.id"))
    valido_de: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    valido_ate: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # ML / OML4Py Extensions
    tipo_execucao: Mapped[Optional[str]] = mapped_column(String(30)) # FORMULA, MODELO_ML, PIPELINE_HIBRIDO
    modelo_nome: Mapped[Optional[str]] = mapped_column(String(120), index=True)
    modelo_versao: Mapped[Optional[str]] = mapped_column(String(60))
    feature_store_ref: Mapped[Optional[str]] = mapped_column(String(240))
    score_confianca_min: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    parametros_modelo: Mapped[Optional[str]] = mapped_column(Text) # CLOB

    # Relationships
    laboratorio: Mapped[Optional["Laboratorio"]] = relationship()
    variaveis: Mapped[list["VariavelCalculo"]] = relationship(back_populates="configuracao", cascade="all, delete-orphan")
    limites: Mapped[list["LimiteReferencia"]] = relationship(back_populates="configuracao", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("tipo_laudo IN ('SOLO','FERTILIZANTE','FOLHA','SEMENTE','PRAGA')"),
        CheckConstraint("ativo IN ('Y','N')"),
        CheckConstraint("valido_ate IS NULL OR valido_ate >= valido_de"),
        CheckConstraint("tipo_execucao IS NULL OR tipo_execucao IN ('FORMULA','MODELO_ML','PIPELINE_HIBRIDO')"),
    )

class VariavelCalculo(Base):
    __tablename__ = "variaveis_calculo"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    configuracao_id: Mapped[int] = mapped_column(ForeignKey("configuracoes_calculo.id"), nullable=False)
    nome_variavel: Mapped[str] = mapped_column(String(60), nullable=False)
    origem_variavel: Mapped[str] = mapped_column(String(20), nullable=False) # AMOSTRA, RESULTADO, CONSTANTE, LIMITE
    parametro_ref: Mapped[Optional[str]] = mapped_column(String(120))
    constante_valor: Mapped[Optional[float]] = mapped_column(Numeric(18, 6))
    descricao: Mapped[Optional[str]] = mapped_column(String(200))

    # Relationships
    configuracao: Mapped["ConfiguracaoCalculo"] = relationship(back_populates="variaveis")

    __table_args__ = (
        UniqueConstraint("configuracao_id", "nome_variavel"),
        CheckConstraint("origem_variavel IN ('AMOSTRA','RESULTADO','CONSTANTE','LIMITE')"),
    )

class LimiteReferencia(Base):
    __tablename__ = "limites_referencia"

    id: Mapped[int] = mapped_column(Identity(start=1, cycle=False), primary_key=True)
    configuracao_id: Mapped[int] = mapped_column(ForeignKey("configuracoes_calculo.id"), nullable=False)
    cultura: Mapped[Optional[str]] = mapped_column(String(80))
    classe: Mapped[str] = mapped_column(String(30), nullable=False) # MUITO_BAIXO, BAIXO, MEDIO, ADEQUADO, ALTO, MUITO_ALTO
    valor_minimo: Mapped[Optional[float]] = mapped_column(Numeric(18, 6))
    valor_maximo: Mapped[Optional[float]] = mapped_column(Numeric(18, 6))
    unidade: Mapped[Optional[str]] = mapped_column(String(30))
    bioma: Mapped[Optional[str]] = mapped_column(String(20))
    metodo_extracao: Mapped[Optional[str]] = mapped_column(String(50))
    versao: Mapped[float] = mapped_column(Numeric(6, 2), nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)

    # Relationships
    configuracao: Mapped["ConfiguracaoCalculo"] = relationship(back_populates="limites")

    __table_args__ = (
        CheckConstraint("classe IN ('MUITO_BAIXO','BAIXO','MEDIO','ADEQUADO','ALTO','MUITO_ALTO')"),
        CheckConstraint("valor_minimo IS NULL OR valor_maximo IS NULL OR valor_maximo >= valor_minimo"),
    )
