from typing import Optional, Sequence
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.laboratorio import Laboratorio, LaboratorioUsuario, TelefoneLaboratorio
from app.schemas.laboratorio import LaboratorioCreate, LaboratorioUpdate
from app.models.usuario import Usuario

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

    async def get_by_user(self, usuario_id: int) -> Sequence[Laboratorio]:
        result = await self.session.execute(
            select(Laboratorio)
            .join(LaboratorioUsuario, LaboratorioUsuario.laboratorio_id == Laboratorio.id)
            .where(LaboratorioUsuario.usuario_id == usuario_id)
            .where(LaboratorioUsuario.papel != "CLIENTE")
            .order_by(Laboratorio.nome)
        )
        return result.scalars().unique().all()

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
        stmt = (
            select(Usuario, LaboratorioUsuario.papel)
            .join(LaboratorioUsuario, LaboratorioUsuario.usuario_id == Usuario.id)
            .where(LaboratorioUsuario.laboratorio_id == lab_id)
            .where(LaboratorioUsuario.papel != "CLIENTE")
        )
        result = await self.session.execute(stmt)
        return [{"user": row[0], "papel": row[1]} for row in result.all()]

    async def add_usuario(self, lab_id: int, usuario_id: int, papel: str) -> bool:
        new_vinc = LaboratorioUsuario(laboratorio_id=lab_id, usuario_id=usuario_id, papel=papel)
        self.session.add(new_vinc)
        await self.session.commit()
        return True

    async def remove_usuario(self, lab_id: int, usuario_id: int) -> bool:
        result = await self.session.execute(
            delete(LaboratorioUsuario)
            .where(LaboratorioUsuario.laboratorio_id == lab_id)
            .where(LaboratorioUsuario.usuario_id == usuario_id)
        )
        await self.session.commit()
        return result.rowcount > 0

    async def get_telefones(self, lab_id: int) -> Sequence[TelefoneLaboratorio]:
        result = await self.session.execute(
            select(TelefoneLaboratorio)
            .where(TelefoneLaboratorio.laboratorio_id == lab_id)
            .order_by(TelefoneLaboratorio.id)
        )
        return result.scalars().all()

    # ── Clients Management ────────────────────────────────────────────────────

    async def add_cliente(self, lab_id: int, usuario_id: int) -> bool:
        existing = await self.session.execute(
            select(LaboratorioUsuario)
            .where(LaboratorioUsuario.laboratorio_id == lab_id)
            .where(LaboratorioUsuario.usuario_id == usuario_id)
            .where(LaboratorioUsuario.papel == "CLIENTE")
        )
        if existing.scalar_one_or_none():
            return True

        self.session.add(
            LaboratorioUsuario(laboratorio_id=lab_id, usuario_id=usuario_id, papel="CLIENTE")
        )
        await self.session.commit()
        return True

    async def get_clientes(self, lab_id: int) -> list[dict]:
        from app.models.amostra_laudo import Amostra, Laudo

        linked_client_ids = (
            select(LaboratorioUsuario.usuario_id)
            .where(LaboratorioUsuario.laboratorio_id == lab_id)
            .where(LaboratorioUsuario.papel == "CLIENTE")
        )
        sample_client_ids = select(Amostra.cliente_id).where(Amostra.laboratorio_id == lab_id)
        client_ids = linked_client_ids.union(sample_client_ids)

        stmt = (
            select(
                Usuario,
                func.count(Laudo.id).label("total_laudos"),
                func.max(Laudo.data_emissao).label("ultimo_laudo"),
            )
            .where(Usuario.id.in_(client_ids))
            .outerjoin(
                Amostra,
                (Amostra.cliente_id == Usuario.id) & (Amostra.laboratorio_id == lab_id),
            )
            .outerjoin(Laudo, Laudo.amostra_id == Amostra.id)
            .group_by(
                Usuario.id,
                Usuario.nome,
                Usuario.sobrenome,
                Usuario.email,
                Usuario.senha_hash,
                Usuario.tipo_usuario,
                Usuario.endereco_id,
                Usuario.ativo,
                Usuario.criado_em,
                Usuario.ultimo_acesso,
                Usuario.plano_ativo,
            )
            .order_by(Usuario.nome)
        )
        result = await self.session.execute(stmt)
        clientes = []
        for usuario, total_laudos, ultimo_laudo in result.all():
            clientes.append({
                "id": usuario.id,
                "nome": usuario.nome,
                "sobrenome": usuario.sobrenome,
                "email": usuario.email,
                "tipo_usuario": usuario.tipo_usuario,
                "ativo": usuario.ativo,
                "criado_em": usuario.criado_em,
                "ultimo_acesso": usuario.ultimo_acesso,
                "total_laudos": total_laudos or 0,
                "ultimo_laudo": ultimo_laudo,
            })
        return clientes
