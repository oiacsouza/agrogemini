from typing import Optional, Sequence
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.amostra_laudo import Amostra
from app.schemas.amostra import AmostraCreate, AmostraUpdate

class AmostraRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self, lab_id: int | None = None, limit: int = 100) -> Sequence[Amostra]:
        stmt = select(Amostra)
        if lab_id:
            stmt = stmt.where(Amostra.laboratorio_id == lab_id)
        stmt = stmt.order_by(Amostra.id.desc()).limit(limit)
        
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_all_by_labs(self, lab_ids: set[int], limit: int = 100) -> Sequence[Amostra]:
        if not lab_ids:
            return []
        result = await self.session.execute(
            select(Amostra)
            .where(Amostra.laboratorio_id.in_(lab_ids))
            .order_by(Amostra.id.desc())
            .limit(limit)
        )
        return result.scalars().all()

    async def get_by_id(self, amostra_id: int) -> Optional[Amostra]:
        result = await self.session.execute(
            select(Amostra).where(Amostra.id == amostra_id)
        )
        return result.scalar_one_or_none()

    async def get_by_cliente(self, cliente_id: int) -> Sequence[Amostra]:
        result = await self.session.execute(
            select(Amostra).where(Amostra.cliente_id == cliente_id).order_by(Amostra.id.desc())
        )
        return result.scalars().all()

    async def create(self, amostra_data: AmostraCreate) -> int:
        new_amostra = Amostra(**amostra_data.model_dump())
        self.session.add(new_amostra)
        await self.session.flush()
        await self.session.commit()
        return new_amostra.id

    async def update(self, amostra_id: int, amostra_data: AmostraUpdate) -> bool:
        update_data = amostra_data.model_dump(exclude_unset=True)
        if not update_data:
            return False

        result = await self.session.execute(
            update(Amostra).where(Amostra.id == amostra_id).values(**update_data)
        )
        await self.session.commit()
        return result.rowcount > 0

    async def delete(self, amostra_id: int) -> bool:
        result = await self.session.execute(
            delete(Amostra).where(Amostra.id == amostra_id)
        )
        await self.session.commit()
        return result.rowcount > 0

    async def count_all(self) -> int:
        result = await self.session.execute(select(func.count()).select_from(Amostra))
        return result.scalar_one()

    async def count_by_lab(self, lab_id: int) -> int:
        result = await self.session.execute(
            select(func.count()).select_from(Amostra).where(Amostra.laboratorio_id == lab_id)
        )
        return result.scalar_one()

    async def count_by_labs(self, lab_ids: set[int]) -> int:
        if not lab_ids:
            return 0
        result = await self.session.execute(
            select(func.count()).select_from(Amostra).where(Amostra.laboratorio_id.in_(lab_ids))
        )
        return result.scalar_one()

    async def count_today_by_labs(self, lab_ids: set[int]) -> int:
        if not lab_ids:
            return 0
        result = await self.session.execute(
            select(func.count())
            .select_from(Amostra)
            .where(Amostra.laboratorio_id.in_(lab_ids))
            .where(func.trunc(Amostra.criado_em) == func.trunc(func.current_date()))
        )
        return result.scalar_one()

    async def count_by_status_for_labs(self, lab_ids: set[int], statuses: list[str]) -> int:
        if not lab_ids:
            return 0
        result = await self.session.execute(
            select(func.count())
            .select_from(Amostra)
            .where(Amostra.laboratorio_id.in_(lab_ids))
            .where(Amostra.status.in_(statuses))
        )
        return result.scalar_one()

    async def monthly_trend_for_labs(self, lab_ids: set[int], months: int = 6) -> list[dict]:
        if not lab_ids:
            return []
        month_expr = func.to_char(Amostra.criado_em, "YYYY-MM")
        result = await self.session.execute(
            select(month_expr.label("month"), func.count().label("samples"))
            .select_from(Amostra)
            .where(Amostra.laboratorio_id.in_(lab_ids))
            .group_by(month_expr)
            .order_by(month_expr.desc())
            .limit(months)
        )
        return [{"month": row.month, "samples": row.samples} for row in reversed(result.all())]
