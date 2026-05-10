from typing import Optional, Sequence
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.talhao import Talhao
from app.schemas.fazenda import TalhaoCreate, TalhaoUpdate

class TalhaoRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> Sequence[Talhao]:
        result = await self.session.execute(
            select(Talhao).order_by(Talhao.identificacao)
        )
        return result.scalars().all()

    async def get_by_id(self, talhao_id: int) -> Optional[Talhao]:
        result = await self.session.execute(
            select(Talhao).where(Talhao.id == talhao_id)
        )
        return result.scalar_one_or_none()

    async def get_by_fazenda(self, fazenda_id: int) -> Sequence[Talhao]:
        result = await self.session.execute(
            select(Talhao).where(Talhao.fazenda_id == fazenda_id).order_by(Talhao.identificacao)
        )
        return result.scalars().all()

    async def create(self, talhao_data: TalhaoCreate) -> int:
        new_tal = Talhao(**talhao_data.model_dump())
        self.session.add(new_tal)
        await self.session.flush()
        await self.session.commit()
        return new_tal.id

    async def update(self, talhao_id: int, talhao_data: TalhaoUpdate) -> bool:
        update_data = talhao_data.model_dump(exclude_unset=True)
        if not update_data:
            return False

        result = await self.session.execute(
            update(Talhao).where(Talhao.id == talhao_id).values(**update_data)
        )
        await self.session.commit()
        return result.rowcount > 0

    async def delete(self, talhao_id: int) -> bool:
        result = await self.session.execute(
            delete(Talhao).where(Talhao.id == talhao_id)
        )
        await self.session.commit()
        return result.rowcount > 0
