from typing import Optional, Sequence
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.amostra_laudo import Laudo, LaudoResultado
from app.schemas.laudo import LaudoCreate, LaudoUpdate, LaudoResultadoCreate

class LaudoRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self, lab_id: int | None = None, limit: int = 100) -> Sequence[Laudo]:
        stmt = select(Laudo)
        if lab_id:
            stmt = stmt.where(Laudo.laboratorio_id == lab_id)
        stmt = stmt.order_by(Laudo.data_emissao.desc()).limit(limit)
        
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, laudo_id: int) -> Optional[Laudo]:
        result = await self.session.execute(
            select(Laudo).where(Laudo.id == laudo_id)
        )
        return result.scalar_one_or_none()

    async def get_by_amostra(self, amostra_id: int) -> Optional[Laudo]:
        result = await self.session.execute(
            select(Laudo).where(Laudo.amostra_id == amostra_id)
        )
        return result.scalar_one_or_none()

    async def get_by_cliente(self, cliente_id: int) -> Sequence[Laudo]:
        from app.models.amostra_laudo import Amostra
        stmt = (
            select(Laudo)
            .join(Amostra, Amostra.id == Laudo.amostra_id)
            .where(Amostra.cliente_id == cliente_id)
            .order_by(Laudo.data_emissao.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def create(self, laudo_data: LaudoCreate) -> int:
        new_laudo = Laudo(**laudo_data.model_dump())
        self.session.add(new_laudo)
        await self.session.flush()
        await self.session.commit()
        return new_laudo.id

    async def update(self, laudo_id: int, laudo_data: LaudoUpdate) -> bool:
        update_data = laudo_data.model_dump(exclude_unset=True)
        if not update_data:
            return False

        result = await self.session.execute(
            update(Laudo).where(Laudo.id == laudo_id).values(**update_data)
        )
        await self.session.commit()
        return result.rowcount > 0

    # ── Results Management ────────────────────────────────────────────────────

    async def get_resultados(self, laudo_id: int) -> Sequence[LaudoResultado]:
        result = await self.session.execute(
            select(LaudoResultado).where(LaudoResultado.laudo_id == laudo_id).order_by(LaudoResultado.ordem_exibicao)
        )
        return result.scalars().all()

    async def add_resultado(self, laudo_id: int, data: LaudoResultadoCreate) -> int:
        new_res = LaudoResultado(laudo_id=laudo_id, **data.model_dump())
        self.session.add(new_res)
        await self.session.flush()
        await self.session.commit()
        return new_res.id
