import oracledb

from app.core.security import hash_password
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate


# Standard SELECT columns — includes plano_ativo
_USER_COLS = (
    "id, nome, sobrenome, email, tipo_usuario, ativo, "
    "endereco_id, criado_em, ultimo_acesso, plano_ativo"
)

_USER_COLS_WITH_PWD = (
    "id, nome, sobrenome, email, senha_hash, tipo_usuario, "
    "ativo, endereco_id, criado_em, ultimo_acesso, plano_ativo"
)


class UsuarioRepository:
    def __init__(self, connection: oracledb.Connection):
        self.connection = connection

    def _row_factory(self, cursor):
        cursor.rowfactory = lambda *args: dict(
            zip([d[0].lower() for d in cursor.description], args)
        )

    def get_all(self):
        with self.connection.cursor() as cursor:
            cursor.execute(
                f"SELECT {_USER_COLS} FROM usuarios ORDER BY id DESC"
            )
            self._row_factory(cursor)
            return cursor.fetchall()

    def get_by_id(self, user_id: int):
        with self.connection.cursor() as cursor:
            cursor.execute(
                f"SELECT {_USER_COLS} FROM usuarios WHERE id = :1",
                [user_id],
            )
            self._row_factory(cursor)
            return cursor.fetchone()

    def get_by_email(self, email: str):
        with self.connection.cursor() as cursor:
            cursor.execute(
                f"SELECT {_USER_COLS} FROM usuarios WHERE email = :1",
                [email],
            )
            self._row_factory(cursor)
            return cursor.fetchone()

    def get_by_email_with_password(self, email: str):
        """Returns user data INCLUDING senha_hash, used for authentication."""
        with self.connection.cursor() as cursor:
            cursor.execute(
                f"SELECT {_USER_COLS_WITH_PWD} FROM usuarios WHERE email = :1",
                [email],
            )
            self._row_factory(cursor)
            return cursor.fetchone()

    def get_by_tipo(self, tipo: str):
        with self.connection.cursor() as cursor:
            cursor.execute(
                f"SELECT {_USER_COLS} FROM usuarios WHERE tipo_usuario = :1 ORDER BY nome",
                [tipo],
            )
            self._row_factory(cursor)
            return cursor.fetchall()

    def create(self, user_data: UsuarioCreate):
        with self.connection.cursor() as cursor:
            hashed = hash_password(user_data.senha)
            sql = """
                INSERT INTO usuarios (nome, sobrenome, email, senha_hash, tipo_usuario, ativo, endereco_id)
                VALUES (:1, :2, :3, :4, :5, :6, :7) RETURNING id INTO :8
            """
            out_val = cursor.var(oracledb.NUMBER)
            cursor.execute(
                sql,
                [
                    user_data.nome,
                    user_data.sobrenome,
                    user_data.email,
                    hashed,
                    user_data.tipo_usuario,
                    user_data.ativo,
                    getattr(user_data, "endereco_id", None),
                    out_val,
                ],
            )
            self.connection.commit()
            return int(out_val.getvalue()[0])

    def create_raw(self, nome, sobrenome, email, senha_hash, tipo_usuario, ativo, endereco_id=None):
        """Create a user with pre-hashed password (used by auth_service)."""
        with self.connection.cursor() as cursor:
            sql = """
                INSERT INTO usuarios (nome, sobrenome, email, senha_hash, tipo_usuario, ativo, endereco_id)
                VALUES (:1, :2, :3, :4, :5, :6, :7) RETURNING id INTO :8
            """
            out_val = cursor.var(oracledb.NUMBER)
            cursor.execute(sql, [nome, sobrenome, email, senha_hash, tipo_usuario, ativo, endereco_id, out_val])
            self.connection.commit()
            return int(out_val.getvalue()[0])

    def update(self, user_id: int, user_data: UsuarioUpdate):
        with self.connection.cursor() as cursor:
            fields = []
            params = {}

            if user_data.nome is not None:
                fields.append("nome = :nome")
                params["nome"] = user_data.nome
            if user_data.sobrenome is not None:
                fields.append("sobrenome = :sobrenome")
                params["sobrenome"] = user_data.sobrenome
            if user_data.email is not None:
                fields.append("email = :email")
                params["email"] = user_data.email
            if user_data.tipo_usuario is not None:
                fields.append("tipo_usuario = :tipo")
                params["tipo"] = user_data.tipo_usuario
            if user_data.ativo is not None:
                fields.append("ativo = :ativo")
                params["ativo"] = user_data.ativo
            if user_data.senha is not None:
                fields.append("senha_hash = :senha")
                params["senha"] = hash_password(user_data.senha)

            if not fields:
                return False

            params["id"] = user_id
            sql = f"UPDATE usuarios SET {', '.join(fields)} WHERE id = :id"
            cursor.execute(sql, params)
            self.connection.commit()
            return cursor.rowcount > 0

    def update_ultimo_acesso(self, user_id: int):
        with self.connection.cursor() as cursor:
            cursor.execute(
                "UPDATE usuarios SET ultimo_acesso = SYSTIMESTAMP WHERE id = :1",
                [user_id],
            )
            self.connection.commit()

    def delete(self, user_id: int):
        with self.connection.cursor() as cursor:
            cursor.execute("DELETE FROM usuarios WHERE id = :1", [user_id])
            self.connection.commit()
            return cursor.rowcount > 0

    # ── Plan-related queries ──────────────────────────────────────────────────

    def get_user_plan(self, user_id: int, tipo_usuario: str) -> str:
        """
        Resolve the effective plan for a user.
        - ADM  → always PREMIUM
        - UE   → from usuarios.plano_ativo
        - UP/UC → from assinaturas table (lab subscription)
        """
        if tipo_usuario == "ADM":
            return "PREMIUM"

        if tipo_usuario == "UE":
            with self.connection.cursor() as cursor:
                cursor.execute(
                    "SELECT plano_ativo FROM usuarios WHERE id = :1", [user_id]
                )
                row = cursor.fetchone()
                return (row[0] if row and row[0] else "FREE")

        # Lab users (UP / UC): check via assinaturas
        with self.connection.cursor() as cursor:
            cursor.execute(
                """SELECT pa.tipo
                   FROM laboratorio_usuarios lu
                   JOIN assinaturas a ON a.laboratorio_id = lu.laboratorio_id
                   JOIN planos_assinaturas pa ON pa.id = a.plano_id
                   WHERE lu.usuario_id = :1
                     AND a.status = 'ATIVA'
                     AND a.data_expiracao >= TRUNC(SYSDATE)
                   ORDER BY pa.id DESC
                   FETCH FIRST 1 ROW ONLY""",
                [user_id],
            )
            row = cursor.fetchone()
            if row:
                # DB stores BASICO/PREMIUM; normalize to FREE/PREMIUM
                return "PREMIUM" if row[0] == "PREMIUM" else "FREE"
            return "FREE"

    def get_lab_sample_usage(self, user_id: int) -> dict:
        """
        For a lab user, return sample count and limit from their active plan.
        Returns: { 'amostras_usadas': int, 'limite_amostras': int|None }
        """
        with self.connection.cursor() as cursor:
            cursor.execute(
                """SELECT a.amostras_consumidas, pa.limite_amostras
                   FROM laboratorio_usuarios lu
                   JOIN assinaturas a ON a.laboratorio_id = lu.laboratorio_id
                   JOIN planos_assinaturas pa ON pa.id = a.plano_id
                   WHERE lu.usuario_id = :1
                     AND a.status = 'ATIVA'
                   FETCH FIRST 1 ROW ONLY""",
                [user_id],
            )
            row = cursor.fetchone()
            if row:
                return {"amostras_usadas": row[0] or 0, "limite_amostras": row[1]}
            # No subscription — hard limit of 5
            return {"amostras_usadas": 0, "limite_amostras": 5}

    # ── Admin queries ─────────────────────────────────────────────────────────

    def count_by_tipo(self, tipo: str) -> int:
        with self.connection.cursor() as cursor:
            cursor.execute(
                "SELECT COUNT(*) FROM usuarios WHERE tipo_usuario = :1", [tipo]
            )
            return cursor.fetchone()[0]

    def count_all(self) -> int:
        with self.connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM usuarios")
            return cursor.fetchone()[0]
