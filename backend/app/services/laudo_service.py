from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.laudo_repository import LaudoRepository


class LaudoService:
    def __init__(self, db_session: AsyncSession):
        self.session = db_session
        self.repo = LaudoRepository(db_session)

    async def get_all(self, lab_id: int | None = None, limit: int = 100):
        return await self.repo.get_all(lab_id=lab_id, limit=limit)

    async def get_by_id(self, lid: int):
        l = await self.repo.get_by_id(lid)
        if not l:
            raise HTTPException(status_code=404, detail="Laudo não encontrado")
        return l

    async def get_by_amostra(self, amostra_id: int):
        return await self.repo.get_by_amostra(amostra_id)

    async def get_by_cliente(self, cliente_id: int):
        return await self.repo.get_by_cliente(cliente_id)

    async def create(self, data):
        new_id = await self.repo.create(data)
        return await self.get_by_id(new_id)

    async def update(self, lid: int, data):
        await self.get_by_id(lid)
        await self.repo.update(lid, data)
        return await self.get_by_id(lid)

    async def delete(self, lid: int):
        await self.get_by_id(lid)
        return await self.repo.delete(lid)

    async def get_resultados(self, laudo_id: int):
        return await self.repo.get_resultados(laudo_id)

    async def add_resultado(self, data):
        return await self.repo.add_resultado(data)
