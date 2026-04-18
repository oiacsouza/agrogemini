import oracledb


class FazendaRepository:
    def __init__(self, connection: oracledb.Connection):
        self.conn = connection

    def _rf(self, cur):
        cur.rowfactory = lambda *a: dict(zip([d[0].lower() for d in cur.description], a))

    def get_all(self):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute("SELECT * FROM fazendas ORDER BY id DESC")
            return cur.fetchall()

    def get_by_id(self, fid: int):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute("SELECT * FROM fazendas WHERE id = :1", [fid])
            return cur.fetchone()

    def create(self, data) -> int:
        with self.conn.cursor() as cur:
            out = cur.var(oracledb.NUMBER)
            cur.execute(
                """INSERT INTO fazendas (nome, cpf_cnpj, endereco_id, car, area_total_ha)
                   VALUES (:1,:2,:3,:4,:5) RETURNING id INTO :6""",
                [data.nome, data.cpf_cnpj, data.endereco_id, data.car, data.area_total_ha, out],
            )
            self.conn.commit()
            return int(out.getvalue()[0])

    def update(self, fid: int, data):
        with self.conn.cursor() as cur:
            fields, params = [], {}
            for f in ("nome", "cpf_cnpj", "endereco_id", "car", "area_total_ha"):
                v = getattr(data, f, None)
                if v is not None:
                    fields.append(f"{f} = :{f}")
                    params[f] = v
            if not fields:
                return False
            params["id"] = fid
            cur.execute(f"UPDATE fazendas SET {', '.join(fields)} WHERE id = :id", params)
            self.conn.commit()
            return cur.rowcount > 0

    def delete(self, fid: int):
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM fazendas WHERE id = :1", [fid])
            self.conn.commit()
            return cur.rowcount > 0

    # ── Fazenda-Usuarios ──────────────────────────────────────────────────────

    def get_usuarios(self, fazenda_id: int):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute(
                """SELECT fu.*, u.nome AS usuario_nome, u.sobrenome AS usuario_sobrenome
                   FROM fazenda_usuarios fu JOIN usuarios u ON u.id = fu.usuario_id
                   WHERE fu.fazenda_id = :1""",
                [fazenda_id],
            )
            return cur.fetchall()

    def add_usuario(self, data) -> int:
        with self.conn.cursor() as cur:
            out = cur.var(oracledb.NUMBER)
            cur.execute(
                """INSERT INTO fazenda_usuarios (fazenda_id, usuario_id, papel, inicio_vigencia, fim_vigencia)
                   VALUES (:1,:2,:3,:4,:5) RETURNING id INTO :6""",
                [data.fazenda_id, data.usuario_id, data.papel, data.inicio_vigencia, data.fim_vigencia, out],
            )
            self.conn.commit()
            return int(out.getvalue()[0])
