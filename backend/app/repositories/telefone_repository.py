from typing import Sequence
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.usuario import TelefoneUsuario
from app.models.laboratorio import TelefoneLaboratorio

class TelefoneRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_usuario(self, usuario_id: int) -> Sequence[TelefoneUsuario]:
        result = await self.session.execute(select(TelefoneUsuario).where(TelefoneUsuario.usuario_id == usuario_id))
        return result.scalars().all()

    async def get_by_laboratorio(self, lab_id: int) -> Sequence[TelefoneLaboratorio]:
        result = await self.session.execute(select(TelefoneLaboratorio).where(TelefoneLaboratorio.laboratorio_id == lab_id))
        return result.scalars().all()

    async def delete_usuario_telefone(self, tel_id: int) -> bool:
        result = await self.session.execute(delete(TelefoneUsuario).where(TelefoneUsuario.id == tel_id))
        await self.session.commit()
        return result.rowcount > 0
