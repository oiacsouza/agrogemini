from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.importacao_repository import ImportacaoRepository


class ImportacaoService:
    def __init__(self, db_session: AsyncSession):
        self.session = db_session
        self.repo = ImportacaoRepository(db_session)

    async def get_all(self, lab_id: int | None = None, limit: int = 100):
        return await self.repo.get_all(lab_id=lab_id, limit=limit)

    async def get_by_id(self, iid: int):
        i = await self.repo.get_by_id(iid)
        if not i:
            raise HTTPException(status_code=404, detail="Importação não encontrada")
        return i

    async def create(self, data):
        new_id = await self.repo.create(data)
        return await self.get_by_id(new_id)

    async def update(self, iid: int, data):
        await self.get_by_id(iid)
        await self.repo.update(iid, data)
        return await self.get_by_id(iid)

    async def delete(self, iid: int):
        await self.get_by_id(iid)
        success = await self.repo.delete(iid)
        if not success:
            raise HTTPException(status_code=500, detail="Não foi possível remover a importação")
        return {"detail": "Importação removida com sucesso"}
