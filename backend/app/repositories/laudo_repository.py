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

    async def get_all_by_labs(self, lab_ids: set[int], limit: int = 100) -> Sequence[Laudo]:
        if not lab_ids:
            return []
        result = await self.session.execute(
            select(Laudo)
            .where(Laudo.laboratorio_id.in_(lab_ids))
            .order_by(Laudo.data_emissao.desc())
            .limit(limit)
        )
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

    async def count_by_labs(self, lab_ids: set[int]) -> int:
        if not lab_ids:
            return 0
        result = await self.session.execute(
            select(func.count()).select_from(Laudo).where(Laudo.laboratorio_id.in_(lab_ids))
        )
        return result.scalar_one()

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

    async def delete(self, laudo_id: int) -> bool:
        result = await self.session.execute(
            delete(Laudo).where(Laudo.id == laudo_id)
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
        new_res = LaudoResultado(laudo_id=laudo_id, **data.model_dump(exclude={"laudo_id"}))
        self.session.add(new_res)
        await self.session.flush()
        await self.session.commit()
        return new_res.id

    async def get_resultado_by_id(self, resultado_id: int) -> Optional[LaudoResultado]:
        result = await self.session.execute(
            select(LaudoResultado).where(LaudoResultado.id == resultado_id)
        )
        return result.scalar_one_or_none()
