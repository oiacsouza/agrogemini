from typing import Optional, Sequence
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.usuario import Usuario, TelefoneUsuario
from app.models.endereco import Endereco
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate
from app.core.security import hash_password

class UsuarioRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> Sequence[Usuario]:
        result = await self.session.execute(
            select(Usuario).order_by(Usuario.id.desc())
        )
        return result.scalars().all()

    async def get_by_id(self, user_id: int) -> Optional[Usuario]:
        result = await self.session.execute(
            select(Usuario).where(Usuario.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[Usuario]:
        result = await self.session.execute(
            select(Usuario).where(Usuario.email == email)
        )
        return result.scalar_one_or_none()

    async def get_by_email_with_password(self, email: str) -> Optional[Usuario]:
        """Returns user data including senha_hash."""
        # In SQLAlchemy, all fields are included by default unless deferred
        return await self.get_by_email(email)

    async def get_by_tipo(self, tipo: str) -> Sequence[Usuario]:
        result = await self.session.execute(
            select(Usuario).where(Usuario.tipo_usuario == tipo).order_by(Usuario.nome)
        )
        return result.scalars().all()

    async def create(self, user_data: UsuarioCreate) -> int:
        hashed = hash_password(user_data.senha)
        new_user = Usuario(
            nome=user_data.nome,
            sobrenome=user_data.sobrenome,
            email=user_data.email,
            senha_hash=hashed,
            tipo_usuario=user_data.tipo_usuario,
            ativo=user_data.ativo,
            endereco_id=getattr(user_data, "endereco_id", None)
        )
        self.session.add(new_user)
        await self.session.flush() # To get the ID
        await self.session.commit()
        return new_user.id

    async def create_raw(self, nome, sobrenome, email, senha_hash, tipo_usuario, ativo, endereco_id=None) -> int:
        new_user = Usuario(
            nome=nome,
            sobrenome=sobrenome,
            email=email,
            senha_hash=senha_hash,
            tipo_usuario=tipo_usuario,
            ativo=ativo,
            endereco_id=endereco_id
        )
        self.session.add(new_user)
        await self.session.flush()
        await self.session.commit()
        return new_user.id

    async def update(self, user_id: int, user_data: UsuarioUpdate) -> bool:
        update_data = user_data.model_dump(exclude_unset=True)
        if "senha" in update_data:
            update_data["senha_hash"] = hash_password(update_data.pop("senha"))
        
        if not update_data:
            return False

        result = await self.session.execute(
            update(Usuario).where(Usuario.id == user_id).values(**update_data)
        )
        await self.session.commit()
        return result.rowcount > 0

    async def update_ultimo_acesso(self, user_id: int):
        await self.session.execute(
            update(Usuario).where(Usuario.id == user_id).values(ultimo_acesso=func.current_timestamp())
        )
        await self.session.commit()

    async def delete(self, user_id: int) -> bool:
        result = await self.session.execute(
            delete(Usuario).where(Usuario.id == user_id)
        )
        await self.session.commit()
        return result.rowcount > 0

    # ── Plan-related queries ──────────────────────────────────────────────────

    async def get_user_plan(self, user_id: int, tipo_usuario: str) -> str:
        if tipo_usuario == "ADM":
            return "PREMIUM"

        if tipo_usuario == "UE":
            result = await self.session.execute(
                select(Usuario.plano_ativo).where(Usuario.id == user_id)
            )
            val = result.scalar_one_or_none()
            return val if val else "FREE"

        # For Lab users (UP/UC), we would need to join with assinaturas
        # This is a placeholder for the logic that needs complex JOINs
        # which will be easier once all models are migrated.
        return "FREE" 

    # ── Admin queries ─────────────────────────────────────────────────────────

    async def count_by_tipo(self, tipo: str) -> int:
        result = await self.session.execute(
            select(func.count()).select_from(Usuario).where(Usuario.tipo_usuario == tipo)
        )
        return result.scalar_one()

    async def count_all(self) -> int:
        result = await self.session.execute(select(func.count()).select_from(Usuario))
        return result.scalar_one()
