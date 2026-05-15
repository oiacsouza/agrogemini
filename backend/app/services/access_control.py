from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.laboratorio import Laboratorio, LaboratorioUsuario


class LabAccessService:
    def __init__(self, db_session: AsyncSession):
        self.session = db_session

    async def visible_lab_ids_for_user(self, user: dict) -> set[int]:
        role = str(user.get("tipo_usuario") or "").strip().upper()
        user_id = int(user["id"])

        labs = (await self.session.execute(select(Laboratorio))).scalars().all()
        labs_by_id = {lab.id: lab for lab in labs}
        children_by_parent: dict[int, list[int]] = {}
        for lab in labs:
            if lab.laboratorio_pai_id:
                children_by_parent.setdefault(lab.laboratorio_pai_id, []).append(lab.id)

        if role == "ADM":
            return set(labs_by_id)

        direct_rows = await self.session.execute(
            select(LaboratorioUsuario.laboratorio_id)
            .where(LaboratorioUsuario.usuario_id == user_id)
            .where(LaboratorioUsuario.papel != "CLIENTE")
        )
        direct_ids = {row[0] for row in direct_rows.all()}

        # Backward compatibility for labs that store the owner directly.
        owner_rows = await self.session.execute(
            select(Laboratorio.id).where(Laboratorio.usuario_id == user_id)
        )
        direct_ids.update(row[0] for row in owner_rows.all())

        visible: set[int] = set()
        for lab_id in direct_ids:
            lab = labs_by_id.get(lab_id)
            if not lab:
                continue

            visible.add(lab_id)
            if lab.laboratorio_pai_id:
                visible.add(lab.laboratorio_pai_id)

            stack = list(children_by_parent.get(lab_id, []))
            while stack:
                child_id = stack.pop()
                if child_id in visible:
                    continue
                visible.add(child_id)
                stack.extend(children_by_parent.get(child_id, []))

        return visible

    async def assert_lab_access(self, user: dict, lab_id: int) -> None:
        visible_ids = await self.visible_lab_ids_for_user(user)
        if lab_id not in visible_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado para este laboratório",
            )

    async def visible_labs_for_user(self, user: dict) -> list[Laboratorio]:
        visible_ids = await self.visible_lab_ids_for_user(user)
        if not visible_ids:
            return []
        result = await self.session.execute(
            select(Laboratorio)
            .where(Laboratorio.id.in_(visible_ids))
            .order_by(Laboratorio.nome)
        )
        return result.scalars().all()

    async def metric_lab_ids_for_user(self, user: dict, lab_id: int) -> set[int]:
        await self.assert_lab_access(user, lab_id)
        visible_ids = await self.visible_lab_ids_for_user(user)

        labs = (await self.session.execute(select(Laboratorio))).scalars().all()
        children_by_parent: dict[int, list[int]] = {}
        for lab in labs:
            if lab.laboratorio_pai_id:
                children_by_parent.setdefault(lab.laboratorio_pai_id, []).append(lab.id)

        scoped = {lab_id}
        stack = list(children_by_parent.get(lab_id, []))
        while stack:
            child_id = stack.pop()
            if child_id in scoped:
                continue
            scoped.add(child_id)
            stack.extend(children_by_parent.get(child_id, []))

        return scoped.intersection(visible_ids)
