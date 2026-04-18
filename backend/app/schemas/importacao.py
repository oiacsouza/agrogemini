from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ImportacaoBase(BaseModel):
    laboratorio_id: int
    usuario_id: int
    nome_arquivo: str
    tipo_arquivo: str
    caminho_arquivo: str
    hash_arquivo: str
    status: str = "ENVIADO"


class ImportacaoCreate(ImportacaoBase):
    formato_instrumento: Optional[str] = None
    total_registros: int = 0
    registros_processados: int = 0


class ImportacaoUpdate(BaseModel):
    status: Optional[str] = None
    mensagem_erro: Optional[str] = None
    total_registros: Optional[int] = None
    registros_processados: Optional[int] = None
    processado_em: Optional[datetime] = None


class ImportacaoResponse(BaseModel):
    id: int
    laboratorio_id: int
    usuario_id: int
    nome_arquivo: str
    tipo_arquivo: str
    formato_instrumento: Optional[str] = None
    caminho_arquivo: str
    hash_arquivo: str
    status: str
    mensagem_erro: Optional[str] = None
    total_registros: int
    registros_processados: int
    criado_em: datetime
    processado_em: Optional[datetime] = None

    model_config = {"from_attributes": True}
