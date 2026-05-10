from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.usuario_repository import UsuarioRepository
from app.repositories.amostra_repository import AmostraRepository
from app.models.laboratorio import Laboratorio
from app.models.fazenda import Fazenda
from app.models.amostra_laudo import Laudo


class AdminService:
    def __init__(self, db_session: AsyncSession):
        self.session = db_session
        self.user_repo = UsuarioRepository(db_session)
        self.amostra_repo = AmostraRepository(db_session)

    async def get_dashboard(self) -> dict:
        """Return system-wide statistics using async SQLAlchemy."""
        total_usuarios = await self.user_repo.count_all()
        total_produtores = await self.user_repo.count_by_tipo("UE")
        total_lab_premium = await self.user_repo.count_by_tipo("UP")
        total_lab_free = await self.user_repo.count_by_tipo("UC")

        # Count total amostras
        res_amostras = await self.session.execute(select(func.count()).select_from(text("amostras")))
        total_amostras = res_amostras.scalar()

        # Count total laudos
        res_laudos = await self.session.execute(select(func.count()).select_from(text("laudos")))
        total_laudos = res_laudos.scalar()

        # Count total labs
        res_labs = await self.session.execute(select(func.count()).select_from(text("laboratorios")))
        total_laboratorios = res_labs.scalar()

        # Count total fazendas
        res_fazendas = await self.session.execute(select(func.count()).select_from(text("fazendas")))
        total_fazendas = res_fazendas.scalar()

        return {
            "total_usuarios": total_usuarios,
            "total_produtores": total_produtores,
            "total_lab_premium": total_lab_premium,
            "total_lab_free": total_lab_free,
            "total_amostras": total_amostras,
            "total_laudos": total_laudos,
            "total_laboratorios": total_laboratorios,
            "total_fazendas": total_fazendas,
        }

    async def get_all_users(self, tipo: str | None = None) -> list:
        """List all users, optionally filtered by tipo."""
        if tipo:
            return await self.user_repo.get_by_tipo(tipo)
        return await self.user_repo.get_all()

    async def get_all_labs(self) -> list:
        """List all labs with subscription info using async SQL."""
        # Using raw SQL with text() for the complex JOINs as interim
        sql = """
            SELECT l.id, l.nome, l.cnpj, l.email, l.ativo, l.criado_em,
                   pa.tipo AS plano_tipo, a.status AS assinatura_status,
                   a.amostras_consumidas, pa.limite_amostras,
                   (SELECT COUNT(*) FROM laboratorio_usuarios lu WHERE lu.laboratorio_id = l.id) AS total_usuarios,
                   (SELECT COUNT(*) FROM amostras am WHERE am.laboratorio_id = l.id) AS total_amostras
            FROM laboratorios l
            LEFT JOIN assinaturas a ON a.laboratorio_id = l.id AND a.status = 'ATIVA'
            LEFT JOIN planos_assinaturas pa ON pa.id = a.plano_id
            ORDER BY l.id
        """
        result = await self.session.execute(text(sql))
        # Convert to list of dicts
        return [dict(row._mapping) for row in result]

    async def get_all_producers(self) -> list:
        """List all producers with plan and farm info."""
        sql = """
            SELECT u.id, u.nome, u.sobrenome, u.email, u.plano_ativo,
                   u.ativo, u.criado_em, u.ultimo_acesso,
                   (SELECT COUNT(*) FROM fazenda_usuarios fu WHERE fu.usuario_id = u.id) AS total_fazendas,
                   (SELECT COUNT(*) FROM amostras am WHERE am.cliente_id = u.id) AS total_amostras
            FROM usuarios u
            WHERE u.tipo_usuario = 'UE'
            ORDER BY u.nome
        """
        result = await self.session.execute(text(sql))
        return [dict(row._mapping) for row in result]
