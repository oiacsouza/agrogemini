from typing import Optional, Sequence
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.amostra_laudo import Importacao
from app.schemas.importacao import ImportacaoCreate, ImportacaoUpdate

class ImportacaoRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self, lab_id: int | None = None) -> Sequence[Importacao]:
        stmt = select(Importacao)
        if lab_id: stmt = stmt.where(Importacao.laboratorio_id == lab_id)
        result = await self.session.execute(stmt.order_by(Importacao.criado_em.desc()))
        return result.scalars().all()

    async def get_by_id(self, id: int) -> Optional[Importacao]:
        result = await self.session.execute(select(Importacao).where(Importacao.id == id))
        return result.scalar_one_or_none()

    async def create(self, data: ImportacaoCreate) -> int:
        new_imp = Importacao(**data.model_dump())
        self.session.add(new_imp)
        await self.session.flush()
        await self.session.commit()
        return new_imp.id

    async def update(self, id: int, data: ImportacaoUpdate) -> bool:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data: return False
        result = await self.session.execute(update(Importacao).where(Importacao.id == id).values(**update_data))
        await self.session.commit()
        return result.rowcount > 0
