from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class EnderecoBase(BaseModel):
    cep: str
    logradouro: str
    numero: str
    complemento: Optional[str] = None
    bairro: str
    cidade: str
    estado: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    pais: str = "Brasil"


class EnderecoCreate(EnderecoBase):
    pass


class EnderecoUpdate(BaseModel):
    cep: Optional[str] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    pais: Optional[str] = None


class EnderecoResponse(EnderecoBase):
    id: int

    model_config = {"from_attributes": True}
