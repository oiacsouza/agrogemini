from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.fazenda_repository import FazendaRepository
from app.repositories.talhao_repository import TalhaoRepository


class FazendaService:
    def __init__(self, db_session: AsyncSession):
        self.session = db_session
        self.repo = FazendaRepository(db_session)
        self.talhao_repo = TalhaoRepository(db_session)

    async def get_all(self):
        return await self.repo.get_all()

    async def get_by_id(self, fid: int):
        f = await self.repo.get_by_id(fid)
        if not f:
            raise HTTPException(status_code=404, detail="Fazenda não encontrada")
        return f

    async def create(self, data):
        new_id = await self.repo.create(data)
        return await self.get_by_id(new_id)

    async def update(self, fid: int, data):
        await self.get_by_id(fid)
        await self.repo.update(fid, data)
        return await self.get_by_id(fid)

    async def delete(self, fid: int):
        await self.get_by_id(fid)
        return await self.repo.delete(fid)

    async def get_talhoes(self, fazenda_id: int):
        await self.get_by_id(fazenda_id)
        return await self.talhao_repo.get_by_fazenda(fazenda_id)

    async def get_usuarios(self, fazenda_id: int):
        return await self.repo.get_usuarios(fazenda_id)

    async def add_usuario(self, data):
        return await self.repo.add_usuario(data)

    async def get_all_talhoes(self):
        return await self.talhao_repo.get_all()

    async def get_talhao_by_id(self, talhao_id: int):
        talhao = await self.talhao_repo.get_by_id(talhao_id)
        if not talhao:
            raise HTTPException(status_code=404, detail="Talhão não encontrado")
        return talhao

    async def create_talhao(self, data):
        await self.get_by_id(data.fazenda_id)
        new_id = await self.talhao_repo.create(data)
        return await self.get_talhao_by_id(new_id)

    async def update_talhao(self, talhao_id: int, data):
        await self.get_talhao_by_id(talhao_id)
        await self.talhao_repo.update(talhao_id, data)
        return await self.get_talhao_by_id(talhao_id)

    async def delete_talhao(self, talhao_id: int):
        await self.get_talhao_by_id(talhao_id)
        success = await self.talhao_repo.delete(talhao_id)
        if not success:
            raise HTTPException(status_code=500, detail="Não foi possível remover o talhão")
        return {"detail": "Talhão removido com sucesso"}
