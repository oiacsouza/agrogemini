from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password, create_access_token
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.models.laboratorio import Laboratorio, LaboratorioUsuario


class AuthService:
    def __init__(self, db_session: AsyncSession):
        self.session = db_session
        self.user_repo = UsuarioRepository(db_session)

    async def login(self, data: LoginRequest) -> TokenResponse:
        user = await self.user_repo.get_by_email_with_password(data.email)
        if not user:
            raise HTTPException(status_code=401, detail="Email ou senha inválidos")

        if not verify_password(data.senha, user.senha_hash):
            raise HTTPException(status_code=401, detail="Email ou senha inválidos")

        if user.ativo != "Y":
            raise HTTPException(status_code=403, detail="Usuário desativado")

        # Update last access
        await self.user_repo.update_ultimo_acesso(user.id)

        # Resolve effective plan
        plano = await self.user_repo.get_user_plan(user.id, user.tipo_usuario)

        token = create_access_token({"sub": str(user.id)})
        return TokenResponse(
            access_token=token,
            user_id=user.id,
            nome=user.nome,
            sobrenome=user.sobrenome,
            email=user.email,
            tipo_usuario=user.tipo_usuario,
            plano=plano,
        )

    async def register(self, data: RegisterRequest) -> TokenResponse:
        # Check duplicate email
        existing = await self.user_repo.get_by_email(data.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email já cadastrado")

        # Create address if provided
        endereco_id = None
        if data.cep and data.logradouro and data.numero and data.bairro and data.cidade and data.estado:
            # Note: EnderecoRepository would also need to be async. 
            # For this pilot, we'll focus on Usuario.
            from app.repositories.endereco_repository import EnderecoRepository
            # If EnderecoRepository is not yet async, this might fail or block.
            # Assuming we'll migrate it next.
            pass

        # Create user with hashed password
        hashed = hash_password(data.senha)

        # Map frontend tipo to DB
        tipo_map = {"producer": "UE", "lab": "UP"}
        tipo = tipo_map.get(data.tipo_usuario, data.tipo_usuario)
        if tipo not in ("UE", "UP", "UC", "ADM"):
            tipo = "UC"

        user_id = await self.user_repo.create_raw(
            nome=data.nome,
            sobrenome=data.sobrenome,
            email=data.email,
            senha_hash=hashed,
            tipo_usuario=tipo,
            ativo="Y",
            endereco_id=endereco_id,
        )

        if tipo == "UP":
            lab = Laboratorio(
                nome=f"Laboratório {data.nome} {data.sobrenome}".strip(),
                cnpj=f"9{user_id:013d}",
                email=data.email,
                usuario_id=user_id,
                tipo_unidade="MATRIZ",
                ativo="Y",
                acreditacao_iso17025="N",
                endereco_id=endereco_id,
            )
            self.session.add(lab)
            await self.session.flush()
            self.session.add(
                LaboratorioUsuario(
                    laboratorio_id=lab.id,
                    usuario_id=user_id,
                    papel="ADMINISTRADOR",
                )
            )
            await self.session.commit()

        token = create_access_token({"sub": str(user_id)})
        return TokenResponse(
            access_token=token,
            user_id=user_id,
            nome=data.nome,
            sobrenome=data.sobrenome,
            email=data.email,
            tipo_usuario=tipo,
            plano="FREE",
        )
