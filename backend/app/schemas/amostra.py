from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class AmostraBase(BaseModel):
    talhao_id: int
    cliente_id: int
    laboratorio_id: int
    codigo_interno: str
    tipo_amostra: str
    data_entrada: date
    status: str = "RECEBIDA"
    prioridade: str = "MEDIA"


class AmostraCreate(AmostraBase):
    importacao_id: Optional[int] = None
    codigo_barras: Optional[str] = None
    descricao: Optional[str] = None
    lote: Optional[str] = None
    tonelada: Optional[float] = None
    metodo_extracao: Optional[str] = None
    data_coleta: Optional[date] = None
    data_saida: Optional[date] = None


class AmostraUpdate(BaseModel):
    status: Optional[str] = None
    prioridade: Optional[str] = None
    data_saida: Optional[date] = None
    descricao: Optional[str] = None
    lote: Optional[str] = None
    tonelada: Optional[float] = None
    metodo_extracao: Optional[str] = None
    codigo_barras: Optional[str] = None


class AmostraResponse(BaseModel):
    id: int
    talhao_id: int
    cliente_id: int
    laboratorio_id: int
    importacao_id: Optional[int] = None
    codigo_interno: str
    codigo_barras: Optional[str] = None
    tipo_amostra: str
    descricao: Optional[str] = None
    lote: Optional[str] = None
    tonelada: Optional[float] = None
    metodo_extracao: Optional[str] = None
    data_coleta: Optional[date] = None
    data_entrada: date
    data_saida: Optional[date] = None
    status: str
    prioridade: str
    criado_em: datetime
    # Joined fields (optional, populated by queries with JOINs)
    cliente_nome: Optional[str] = None
    talhao_identificacao: Optional[str] = None
    fazenda_nome: Optional[str] = None

    model_config = {"from_attributes": True}
