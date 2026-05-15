from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.amostra_repository import AmostraRepository


class AmostraService:
    def __init__(self, db_session: AsyncSession):
        self.session = db_session
        self.repo = AmostraRepository(db_session)

    async def get_all(self, lab_id: int | None = None, limit: int = 100):
        return await self.repo.get_all(lab_id=lab_id, limit=limit)

    async def get_all_by_labs(self, lab_ids: set[int], limit: int = 100):
        return await self.repo.get_all_by_labs(lab_ids=lab_ids, limit=limit)

    async def get_by_id(self, aid: int):
        a = await self.repo.get_by_id(aid)
        if not a:
            raise HTTPException(status_code=404, detail="Amostra não encontrada")
        return a

    async def get_by_cliente(self, cliente_id: int):
        return await self.repo.get_by_cliente(cliente_id)

    async def create(self, data):
        new_id = await self.repo.create(data)
        return await self.get_by_id(new_id)

    async def update(self, aid: int, data):
        await self.get_by_id(aid)
        await self.repo.update(aid, data)
        return await self.get_by_id(aid)

    async def delete(self, aid: int):
        await self.get_by_id(aid)
        return await self.repo.delete(aid)
