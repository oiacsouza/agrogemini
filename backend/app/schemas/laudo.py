from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


# ── Laudo ─────────────────────────────────────────────────────────────────────

class LaudoBase(BaseModel):
    amostra_id: int
    laboratorio_id: int
    tipo_laudo: str
    numero_laudo: str
    data_emissao: date
    status: str = "RASCUNHO"


class LaudoCreate(LaudoBase):
    responsavel_id: Optional[int] = None
    numero_pedido: Optional[str] = None
    solicitante_nome: Optional[str] = None
    razao_social: Optional[str] = None
    propriedade: Optional[str] = None
    cidade: Optional[str] = None
    data_entrada: Optional[date] = None
    data_saida: Optional[date] = None
    pdf_path: Optional[str] = None
    hash_autenticacao: Optional[str] = None
    observacoes: Optional[str] = None
    responsavel_tecnico_nome: Optional[str] = None
    responsavel_tecnico_registro: Optional[str] = None
    credenciamento_mapa: Optional[str] = None


class LaudoUpdate(BaseModel):
    status: Optional[str] = None
    data_saida: Optional[date] = None
    pdf_path: Optional[str] = None
    hash_autenticacao: Optional[str] = None
    observacoes: Optional[str] = None
    responsavel_tecnico_nome: Optional[str] = None
    responsavel_tecnico_registro: Optional[str] = None


class LaudoResponse(BaseModel):
    id: int
    amostra_id: int
    laboratorio_id: int
    responsavel_id: Optional[int] = None
    tipo_laudo: str
    numero_pedido: Optional[str] = None
    numero_laudo: str
    solicitante_nome: Optional[str] = None
    razao_social: Optional[str] = None
    propriedade: Optional[str] = None
    cidade: Optional[str] = None
    data_entrada: Optional[date] = None
    data_saida: Optional[date] = None
    data_emissao: date
    status: str
    pdf_path: Optional[str] = None
    hash_autenticacao: Optional[str] = None
    observacoes: Optional[str] = None
    responsavel_tecnico_nome: Optional[str] = None
    responsavel_tecnico_registro: Optional[str] = None
    credenciamento_mapa: Optional[str] = None
    criado_em: datetime

    model_config = {"from_attributes": True}


# ── Laudo Resultado ───────────────────────────────────────────────────────────

class LaudoResultadoBase(BaseModel):
    laudo_id: int
    parametro: str
    ordem_exibicao: int
    fora_spec: str = "N"


class LaudoResultadoCreate(LaudoResultadoBase):
    configuracao_id: Optional[int] = None
    unidade: Optional[str] = None
    garantia: Optional[str] = None
    resultado: Optional[float] = None
    resultado_convertido: Optional[float] = None
    unidade_convertida: Optional[str] = None
    classe_interpretativa: Optional[str] = None


class LaudoResultadoResponse(BaseModel):
    id: int
    laudo_id: int
    configuracao_id: Optional[int] = None
    parametro: str
    unidade: Optional[str] = None
    garantia: Optional[str] = None
    resultado: Optional[float] = None
    resultado_convertido: Optional[float] = None
    unidade_convertida: Optional[str] = None
    classe_interpretativa: Optional[str] = None
    ordem_exibicao: int
    fora_spec: str

    model_config = {"from_attributes": True}
