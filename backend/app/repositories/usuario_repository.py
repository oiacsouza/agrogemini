import oracledb

from app.core.security import hash_password
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate


class UsuarioRepository:
    def __init__(self, connection: oracledb.Connection):
        self.connection = connection

    def _row_factory(self, cursor):
        cursor.rowfactory = lambda *args: dict(
            zip([d[0].lower() for d in cursor.description], args)
        )

    def get_all(self):
        with self.connection.cursor() as cursor:
            self._row_factory(cursor)
            cursor.execute(
                "SELECT id, nome, sobrenome, email, tipo_usuario, ativo, "
                "endereco_id, criado_em, ultimo_acesso "
                "FROM usuarios ORDER BY id DESC"
            )
            return cursor.fetchall()

    def get_by_id(self, user_id: int):
        with self.connection.cursor() as cursor:
            self._row_factory(cursor)
            cursor.execute(
                "SELECT id, nome, sobrenome, email, tipo_usuario, ativo, "
                "endereco_id, criado_em, ultimo_acesso "
                "FROM usuarios WHERE id = :1",
                [user_id],
            )
            return cursor.fetchone()

    def get_by_email(self, email: str):
        with self.connection.cursor() as cursor:
            self._row_factory(cursor)
            cursor.execute(
                "SELECT id, nome, sobrenome, email, tipo_usuario, ativo, "
                "endereco_id, criado_em, ultimo_acesso "
                "FROM usuarios WHERE email = :1",
                [email],
            )
            return cursor.fetchone()

    def get_by_email_with_password(self, email: str):
        """Returns user data INCLUDING senha_hash, used for authentication."""
        with self.connection.cursor() as cursor:
            self._row_factory(cursor)
            cursor.execute(
                "SELECT id, nome, sobrenome, email, senha_hash, tipo_usuario, "
                "ativo, endereco_id, criado_em, ultimo_acesso "
                "FROM usuarios WHERE email = :1",
                [email],
            )
            return cursor.fetchone()

    def get_by_tipo(self, tipo: str):
        with self.connection.cursor() as cursor:
            self._row_factory(cursor)
            cursor.execute(
                "SELECT id, nome, sobrenome, email, tipo_usuario, ativo, "
                "endereco_id, criado_em, ultimo_acesso "
                "FROM usuarios WHERE tipo_usuario = :1 ORDER BY nome",
                [tipo],
            )
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
