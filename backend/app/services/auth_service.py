from fastapi import HTTPException

import oracledb

from app.core.security import hash_password, verify_password, create_access_token
from app.repositories.usuario_repository import UsuarioRepository
from app.repositories.endereco_repository import EnderecoRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse


class AuthService:
    def __init__(self, db_conn: oracledb.Connection):
        self.user_repo = UsuarioRepository(db_conn)
        self.endereco_repo = EnderecoRepository(db_conn)

    def login(self, data: LoginRequest) -> TokenResponse:
        user = self.user_repo.get_by_email_with_password(data.email)
        if not user:
            raise HTTPException(status_code=401, detail="Email ou senha inválidos")

        if not verify_password(data.senha, user["senha_hash"]):
            raise HTTPException(status_code=401, detail="Email ou senha inválidos")

        if user.get("ativo") != "Y":
            raise HTTPException(status_code=403, detail="Usuário desativado")

        # Update last access
        self.user_repo.update_ultimo_acesso(user["id"])

        token = create_access_token({"sub": str(user["id"])})
        return TokenResponse(
            access_token=token,
            user_id=user["id"],
            nome=user["nome"],
            sobrenome=user["sobrenome"],
            email=user["email"],
            tipo_usuario=user["tipo_usuario"],
        )

    def register(self, data: RegisterRequest) -> TokenResponse:
        # Check duplicate email
        existing = self.user_repo.get_by_email(data.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email já cadastrado")

        # Create address if provided
        endereco_id = None
        if data.cep and data.logradouro and data.numero and data.bairro and data.cidade and data.estado:
            endereco_id = self.endereco_repo.create_from_dict({
                "cep": data.cep,
                "logradouro": data.logradouro,
                "numero": data.numero,
                "complemento": data.complemento,
                "bairro": data.bairro,
                "cidade": data.cidade,
                "estado": data.estado,
                "pais": data.pais,
            })

        # Create user with hashed password
        hashed = hash_password(data.senha)

        # Map frontend tipo to DB
        tipo_map = {"producer": "UP", "lab": "UE"}
        tipo = tipo_map.get(data.tipo_usuario, data.tipo_usuario)
        if tipo not in ("UE", "UP", "UC", "ADM"):
            tipo = "UC"

        user_id = self.user_repo.create_raw(
            nome=data.nome,
            sobrenome=data.sobrenome,
            email=data.email,
            senha_hash=hashed,
            tipo_usuario=tipo,
            ativo="Y",
            endereco_id=endereco_id,
        )

        # Create phone if provided
        if data.telefone:
            from app.repositories.telefone_repository import TelefoneUsuarioRepository
            try:
                tel_repo = TelefoneUsuarioRepository(self.user_repo.connection)
                tel_repo.create(user_id, data.telefone, data.tipo_telefone, data.whatsapp)
            except Exception:
                pass  # Non-critical, user is already created

        token = create_access_token({"sub": str(user_id)})
        return TokenResponse(
            access_token=token,
            user_id=user_id,
            nome=data.nome,
            sobrenome=data.sobrenome,
            email=data.email,
            tipo_usuario=tipo,
        )
