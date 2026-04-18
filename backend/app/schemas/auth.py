from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    nome: str
    sobrenome: str
    email: str
    tipo_usuario: str


class RegisterRequest(BaseModel):
    # Personal data
    nome: str
    sobrenome: str
    email: EmailStr
    senha: str
    tipo_usuario: str = "UC"
    # Phone (optional)
    telefone: str | None = None
    tipo_telefone: str = "MOVEL"
    whatsapp: str = "Y"
    # Address (optional)
    cep: str | None = None
    logradouro: str | None = None
    numero: str | None = None
    complemento: str | None = None
    bairro: str | None = None
    cidade: str | None = None
    estado: str | None = None
    pais: str = "Brasil"
