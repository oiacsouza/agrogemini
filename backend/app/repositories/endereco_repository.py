from typing import Optional, Sequence
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.endereco import Endereco
from app.schemas.endereco import EnderecoCreate, EnderecoUpdate

class EnderecoRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> Sequence[Endereco]:
        result = await self.session.execute(select(Endereco).order_by(Endereco.id))
        return result.scalars().all()

    async def get_by_id(self, endereco_id: int) -> Optional[Endereco]:
        result = await self.session.execute(select(Endereco).where(Endereco.id == endereco_id))
        return result.scalar_one_or_none()

    async def create(self, data: EnderecoCreate) -> int:
        new_end = Endereco(**data.model_dump())
        self.session.add(new_end)
        await self.session.flush()
        await self.session.commit()
        return new_end.id

    async def update(self, id: int, data: EnderecoUpdate) -> bool:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data: return False
        result = await self.session.execute(update(Endereco).where(Endereco.id == id).values(**update_data))
        await self.session.commit()
        return result.rowcount > 0

    async def delete(self, id: int) -> bool:
        result = await self.session.execute(delete(Endereco).where(Endereco.id == id))
        await self.session.commit()
        return result.rowcount > 0
