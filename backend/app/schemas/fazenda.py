from datetime import date, datetime
from typing import Optional
import re

from pydantic import BaseModel, field_validator

from app.core.validators import validate_cpf_cnpj


# ── Fazenda ───────────────────────────────────────────────────────────────────

class FazendaBase(BaseModel):
    nome: str
    cpf_cnpj: str
    car: Optional[str] = None
    area_total_ha: Optional[float] = None

    @field_validator("cpf_cnpj")
    @classmethod
    def validate_id(cls, v: str) -> str:
        if not validate_cpf_cnpj(v):
            raise ValueError("CPF ou CNPJ inválido matematicamente.")
        return re.sub(r'[^0-9]', '', v)


class FazendaCreate(FazendaBase):
    endereco_id: Optional[int] = None


class FazendaUpdate(BaseModel):
    nome: Optional[str] = None
    cpf_cnpj: Optional[str] = None
    endereco_id: Optional[int] = None
    car: Optional[str] = None
    area_total_ha: Optional[float] = None


class FazendaResponse(FazendaBase):
    id: int
    endereco_id: Optional[int] = None
    criado_em: datetime

    model_config = {"from_attributes": True}


# ── Fazenda-Usuario ───────────────────────────────────────────────────────────

class FazendaUsuarioBase(BaseModel):
    fazenda_id: int
    usuario_id: int
    papel: str
    inicio_vigencia: date
    fim_vigencia: Optional[date] = None


class FazendaUsuarioCreate(FazendaUsuarioBase):
    pass


class FazendaUsuarioResponse(FazendaUsuarioBase):
    id: int

    model_config = {"from_attributes": True}


# ── Talhao ────────────────────────────────────────────────────────────────────

class TalhaoBase(BaseModel):
    fazenda_id: int
    identificacao: str
    tipo_plantio: str
    area: Optional[float] = None
    profundidade_amostragem_cm: Optional[float] = None
    textura_solo: Optional[str] = None
    bioma: Optional[str] = None
    latitude_centroide: Optional[float] = None
    longitude_centroide: Optional[float] = None


class TalhaoCreate(TalhaoBase):
    pass


class TalhaoUpdate(BaseModel):
    identificacao: Optional[str] = None
    tipo_plantio: Optional[str] = None
    area: Optional[float] = None
    profundidade_amostragem_cm: Optional[float] = None
    textura_solo: Optional[str] = None
    bioma: Optional[str] = None
    latitude_centroide: Optional[float] = None
    longitude_centroide: Optional[float] = None


class TalhaoResponse(TalhaoBase):
    id: int
    criado_em: datetime

    model_config = {"from_attributes": True}
