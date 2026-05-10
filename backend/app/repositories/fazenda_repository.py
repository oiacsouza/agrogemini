from typing import Optional, Sequence
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.fazenda import Fazenda, FazendaUsuario
from app.schemas.fazenda import FazendaCreate, FazendaUpdate

class FazendaRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> Sequence[Fazenda]:
        result = await self.session.execute(
            select(Fazenda).order_by(Fazenda.nome)
        )
        return result.scalars().all()

    async def get_by_id(self, fazenda_id: int) -> Optional[Fazenda]:
        result = await self.session.execute(
            select(Fazenda).where(Fazenda.id == fazenda_id)
        )
        return result.scalar_one_or_none()

    async def get_by_cpf_cnpj(self, cpf_cnpj: str) -> Optional[Fazenda]:
        result = await self.session.execute(
            select(Fazenda).where(Fazenda.cpf_cnpj == cpf_cnpj)
        )
        return result.scalar_one_or_none()

    async def create(self, fazenda_data: FazendaCreate) -> int:
        new_faz = Fazenda(**fazenda_data.model_dump())
        self.session.add(new_faz)
        await self.session.flush()
        await self.session.commit()
        return new_faz.id

    async def update(self, fazenda_id: int, fazenda_data: FazendaUpdate) -> bool:
        update_data = fazenda_data.model_dump(exclude_unset=True)
        if not update_data:
            return False

        result = await self.session.execute(
            update(Fazenda).where(Fazenda.id == fazenda_id).values(**update_data)
        )
        await self.session.commit()
        return result.rowcount > 0

    async def delete(self, fazenda_id: int) -> bool:
        result = await self.session.execute(
            delete(Fazenda).where(Fazenda.id == fazenda_id)
        )
        await self.session.commit()
        return result.rowcount > 0

    # ── User Links ───────────────────────────────────────────────────────────

    async def get_usuarios(self, fazenda_id: int) -> list:
        from app.models.usuario import Usuario
        stmt = (
            select(Usuario, FazendaUsuario.papel)
            .join(FazendaUsuario, FazendaUsuario.usuario_id == Usuario.id)
            .where(FazendaUsuario.fazenda_id == fazenda_id)
        )
        result = await self.session.execute(stmt)
        return [{"user": row[0], "papel": row[1]} for row in result.all()]

    async def add_usuario(self, fazenda_id: int, usuario_id: int, papel: str) -> bool:
        from datetime import datetime
        new_vinc = FazendaUsuario(fazenda_id=fazenda_id, usuario_id=usuario_id, papel=papel, inicio_vigencia=datetime.now())
        self.session.add(new_vinc)
        await self.session.commit()
        return True
