from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class UsuarioBase(BaseModel):
    nome: str
    sobrenome: str
    email: EmailStr
    tipo_usuario: str
    ativo: str = "Y"

class UsuarioCreate(UsuarioBase):
    senha: str

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    sobrenome: Optional[str] = None
    email: Optional[EmailStr] = None
    tipo_usuario: Optional[str] = None
    ativo: Optional[str] = None
    senha: Optional[str] = None

class UsuarioResponse(UsuarioBase):
    id: int
    criado_em: datetime
    ultimo_acesso: Optional[datetime] = None

    model_config = {"from_attributes": True}
