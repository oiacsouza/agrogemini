from typing import Optional, Sequence
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.laboratorio import Laboratorio, LaboratorioUsuario, TelefoneLaboratorio
from app.schemas.laboratorio import LaboratorioCreate, LaboratorioUpdate

class LaboratorioRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> Sequence[Laboratorio]:
        result = await self.session.execute(
            select(Laboratorio).order_by(Laboratorio.nome)
        )
        return result.scalars().all()

    async def get_by_id(self, lab_id: int) -> Optional[Laboratorio]:
        result = await self.session.execute(
            select(Laboratorio).where(Laboratorio.id == lab_id)
        )
        return result.scalar_one_or_none()

    async def get_by_cnpj(self, cnpj: str) -> Optional[Laboratorio]:
        result = await self.session.execute(
            select(Laboratorio).where(Laboratorio.cnpj == cnpj)
        )
        return result.scalar_one_or_none()

    async def create(self, lab_data: LaboratorioCreate) -> int:
        new_lab = Laboratorio(**lab_data.model_dump())
        self.session.add(new_lab)
        await self.session.flush()
        await self.session.commit()
        return new_lab.id

    async def update(self, lab_id: int, lab_data: LaboratorioUpdate) -> bool:
        update_data = lab_data.model_dump(exclude_unset=True)
        if not update_data:
            return False

        result = await self.session.execute(
            update(Laboratorio).where(Laboratorio.id == lab_id).values(**update_data)
        )
        await self.session.commit()
        return result.rowcount > 0

    async def delete(self, lab_id: int) -> bool:
        result = await self.session.execute(
            delete(Laboratorio).where(Laboratorio.id == lab_id)
        )
        await self.session.commit()
        return result.rowcount > 0

    # ── Staff Management ──────────────────────────────────────────────────────

    async def get_usuarios(self, lab_id: int) -> list:
        # Complex query for users and their roles in a lab
        from app.models.usuario import Usuario
        stmt = (
            select(Usuario, LaboratorioUsuario.papel)
            .join(LaboratorioUsuario, LaboratorioUsuario.usuario_id == Usuario.id)
            .where(LaboratorioUsuario.laboratorio_id == lab_id)
        )
        result = await self.session.execute(stmt)
        return [{"user": row[0], "papel": row[1]} for row in result.all()]

    async def add_usuario(self, lab_id: int, usuario_id: int, papel: str) -> bool:
        new_vinc = LaboratorioUsuario(laboratorio_id=lab_id, usuario_id=usuario_id, papel=papel)
        self.session.add(new_vinc)
        await self.session.commit()
        return True
