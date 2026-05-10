from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.laboratorio_repository import LaboratorioRepository


class LaboratorioService:
    def __init__(self, db_session: AsyncSession):
        self.session = db_session
        self.repo = LaboratorioRepository(db_session)

    async def get_all(self):
        return await self.repo.get_all()

    async def get_with_stats(self):
        return await self.repo.get_with_stats()

    async def get_by_id(self, lid: int):
        lab = await self.repo.get_by_id(lid)
        if not lab:
            raise HTTPException(status_code=404, detail="Laboratório não encontrado")
        return lab

    async def get_by_user(self, user_id: int):
        return await self.repo.get_by_user(user_id)

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

    # Employees
    async def get_usuarios(self, lab_id: int):
        return await self.repo.get_usuarios(lab_id)

    async def add_usuario(self, lab_id: int, usuario_id: int, papel: str, registro_crea=None):
        return await self.repo.add_usuario(lab_id, usuario_id, papel, registro_crea)

    async def remove_usuario(self, assoc_id: int):
        return await self.repo.remove_usuario(assoc_id)

    # Phones
    async def get_telefones(self, lab_id: int):
        return await self.repo.get_telefones(lab_id)

    async def add_telefone(self, lab_id: int, numero: str, tipo: str):
        return await self.repo.add_telefone(lab_id, numero, tipo)
