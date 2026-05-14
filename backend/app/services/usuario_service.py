from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate


class UsuarioService:
    def __init__(self, db_session: AsyncSession):
        self.session = db_session
        self.repo = UsuarioRepository(db_session)

    async def get_usuarios(self):
        return await self.repo.get_all()

    async def get_all(self):
        return await self.get_usuarios()

    async def get_usuario_by_id(self, user_id: int):
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        return user

    async def get_by_id(self, user_id: int):
        return await self.get_usuario_by_id(user_id)

    async def get_usuarios_by_tipo(self, tipo: str):
        return await self.repo.get_by_tipo(tipo)

    async def create_usuario(self, user_data: UsuarioCreate):
        existing = await self.repo.get_by_email(user_data.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email já cadastrado")
        new_id = await self.repo.create(user_data)
        return await self.get_usuario_by_id(new_id)

    async def create(self, user_data: UsuarioCreate):
        return await self.create_usuario(user_data)

    async def update_usuario(self, user_id: int, user_data: UsuarioUpdate):
        user = await self.get_usuario_by_id(user_id)
        if user_data.email and user_data.email != user.email:
            existing = await self.repo.get_by_email(user_data.email)
            if existing:
                raise HTTPException(status_code=400, detail="Email já cadastrado para outro usuário")
        await self.repo.update(user_id, user_data)
        return await self.get_usuario_by_id(user_id)

    async def update(self, user_id: int, user_data: UsuarioUpdate):
        return await self.update_usuario(user_id, user_data)

    async def delete_usuario(self, user_id: int):
        await self.get_usuario_by_id(user_id)
        success = await self.repo.delete(user_id)
        if not success:
            raise HTTPException(status_code=500, detail="Não foi possível remover o usuário")
        return {"detail": "Usuário removido com sucesso"}

    async def delete(self, user_id: int):
        return await self.delete_usuario(user_id)
