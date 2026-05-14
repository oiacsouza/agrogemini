from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.endereco_repository import EnderecoRepository


class EnderecoService:
    def __init__(self, db_session: AsyncSession):
        self.session = db_session
        self.repo = EnderecoRepository(db_session)

    async def get_all(self):
        return await self.repo.get_all()

    async def get_by_id(self, eid: int):
        e = await self.repo.get_by_id(eid)
        if not e:
            raise HTTPException(status_code=404, detail="Endereço não encontrado")
        return e

    async def create(self, data):
        new_id = await self.repo.create(data)
        return await self.get_by_id(new_id)

    async def update(self, eid: int, data):
        await self.get_by_id(eid)
        await self.repo.update(eid, data)
        return await self.get_by_id(eid)

    async def delete(self, eid: int):
        await self.get_by_id(eid)
        return await self.repo.delete(eid)
