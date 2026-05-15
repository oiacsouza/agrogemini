from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class LaboratorioBase(BaseModel):
    nome: str
    cnpj: str
    email: EmailStr
    usuario_id: Optional[int] = None
    laboratorio_pai_id: Optional[int] = None
    tipo_unidade: str = "MATRIZ"
    ativo: str = "Y"
    acreditacao_iso17025: str = "N"
    registro_renasem: Optional[str] = None
    credenciamento_mapa: Optional[str] = None


class LaboratorioCreate(LaboratorioBase):
    endereco_id: Optional[int] = None


class LaboratorioUpdate(BaseModel):
    nome: Optional[str] = None
    cnpj: Optional[str] = None
    email: Optional[EmailStr] = None
    usuario_id: Optional[int] = None
    laboratorio_pai_id: Optional[int] = None
    tipo_unidade: Optional[str] = None
    ativo: Optional[str] = None
    acreditacao_iso17025: Optional[str] = None
    registro_renasem: Optional[str] = None
    credenciamento_mapa: Optional[str] = None
    endereco_id: Optional[int] = None


class LaboratorioResponse(LaboratorioBase):
    id: int
    usuario_id: Optional[int] = None
    laboratorio_pai_id: Optional[int] = None
    tipo_unidade: str = "MATRIZ"
    endereco_id: Optional[int] = None
    criado_em: datetime

    model_config = {"from_attributes": True}


# ── Lab-User association ──────────────────────────────────────────────────────

class LabUsuarioBase(BaseModel):
    laboratorio_id: int
    usuario_id: int
    papel: str
    registro_crea: Optional[str] = None


class LabUsuarioCreate(LabUsuarioBase):
    pass


class LabUsuarioResponse(LabUsuarioBase):
    id: int
    # Joined fields
    usuario_nome: Optional[str] = None
    usuario_sobrenome: Optional[str] = None
    usuario_email: Optional[str] = None
    usuario_ativo: Optional[str] = None

    model_config = {"from_attributes": True}


# ── Lab phone ────────────────────────────────────────────────────────────────

class TelefoneLabBase(BaseModel):
    laboratorio_id: int
    numero: str
    tipo: str


class TelefoneLabCreate(TelefoneLabBase):
    pass


class TelefoneLabResponse(TelefoneLabBase):
    id: int

    model_config = {"from_attributes": True}
