import oracledb

from app.repositories.usuario_repository import UsuarioRepository
from app.repositories.amostra_repository import AmostraRepository


class AdminService:
    def __init__(self, db_conn: oracledb.Connection):
        self.conn = db_conn
        self.user_repo = UsuarioRepository(db_conn)
        self.amostra_repo = AmostraRepository(db_conn)

    def get_dashboard(self) -> dict:
        """Return system-wide statistics."""
        total_usuarios = self.user_repo.count_all()
        total_produtores = self.user_repo.count_by_tipo("UE")
        total_lab_premium = self.user_repo.count_by_tipo("UP")
        total_lab_free = self.user_repo.count_by_tipo("UC")

        # Count total amostras
        with self.conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM amostras")
            total_amostras = cur.fetchone()[0]

        # Count total laudos
        with self.conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM laudos")
            total_laudos = cur.fetchone()[0]

        # Count total labs
        with self.conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM laboratorios")
            total_laboratorios = cur.fetchone()[0]

        # Count total fazendas
        with self.conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM fazendas")
            total_fazendas = cur.fetchone()[0]

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

    def get_all_users(self, tipo: str | None = None) -> list:
        """List all users, optionally filtered by tipo."""
        if tipo:
            return self.user_repo.get_by_tipo(tipo)
        return self.user_repo.get_all()

    def get_all_labs(self) -> list:
        """List all labs with subscription info."""
        with self.conn.cursor() as cur:
            cur.rowfactory = lambda *a: dict(zip([d[0].lower() for d in cur.description], a))
            cur.execute("""
                SELECT l.id, l.nome, l.cnpj, l.email, l.ativo, l.criado_em,
                       pa.tipo AS plano_tipo, a.status AS assinatura_status,
                       a.amostras_consumidas, pa.limite_amostras,
                       (SELECT COUNT(*) FROM laboratorio_usuarios lu WHERE lu.laboratorio_id = l.id) AS total_usuarios,
                       (SELECT COUNT(*) FROM amostras am WHERE am.laboratorio_id = l.id) AS total_amostras
                FROM laboratorios l
                LEFT JOIN assinaturas a ON a.laboratorio_id = l.id AND a.status = 'ATIVA'
                LEFT JOIN planos_assinaturas pa ON pa.id = a.plano_id
                ORDER BY l.id
            """)
            return cur.fetchall()

    def get_all_producers(self) -> list:
        """List all producers with plan and farm info."""
        with self.conn.cursor() as cur:
            cur.rowfactory = lambda *a: dict(zip([d[0].lower() for d in cur.description], a))
            cur.execute("""
                SELECT u.id, u.nome, u.sobrenome, u.email, u.plano_ativo,
                       u.ativo, u.criado_em, u.ultimo_acesso,
                       (SELECT COUNT(*) FROM fazenda_usuarios fu WHERE fu.usuario_id = u.id) AS total_fazendas,
                       (SELECT COUNT(*) FROM amostras am WHERE am.cliente_id = u.id) AS total_amostras
                FROM usuarios u
                WHERE u.tipo_usuario = 'UE'
                ORDER BY u.nome
            """)
            return cur.fetchall()
