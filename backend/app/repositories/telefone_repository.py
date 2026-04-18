import oracledb


class TelefoneUsuarioRepository:
    def __init__(self, connection: oracledb.Connection):
        self.conn = connection

    def _rf(self, cur):
        cur.rowfactory = lambda *a: dict(zip([d[0].lower() for d in cur.description], a))

    def get_by_usuario(self, usuario_id: int):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute("SELECT * FROM telefones_usuarios WHERE usuario_id = :1", [usuario_id])
            return cur.fetchall()

    def create(self, usuario_id: int, numero: str, tipo: str = "MOVEL", whatsapp: str = "Y") -> int:
        with self.conn.cursor() as cur:
            out = cur.var(oracledb.NUMBER)
            cur.execute(
                """INSERT INTO telefones_usuarios (usuario_id, numero, tipo, whatsapp)
                   VALUES (:1,:2,:3,:4) RETURNING id INTO :5""",
                [usuario_id, numero, tipo, whatsapp, out],
            )
            self.conn.commit()
            return int(out.getvalue()[0])

    def delete(self, tel_id: int):
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM telefones_usuarios WHERE id = :1", [tel_id])
            self.conn.commit()
            return cur.rowcount > 0
