import oracledb


class EnderecoRepository:
    def __init__(self, connection: oracledb.Connection):
        self.conn = connection

    def _rf(self, cur):
        cur.rowfactory = lambda *a: dict(zip([d[0].lower() for d in cur.description], a))

    def get_all(self):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute("SELECT * FROM enderecos ORDER BY id DESC")
            return cur.fetchall()

    def get_by_id(self, eid: int):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute("SELECT * FROM enderecos WHERE id = :1", [eid])
            return cur.fetchone()

    def create(self, data) -> int:
        with self.conn.cursor() as cur:
            out = cur.var(oracledb.NUMBER)
            cur.execute(
                """INSERT INTO enderecos (cep, logradouro, numero, complemento, bairro, cidade, estado, latitude, longitude, pais)
                   VALUES (:1,:2,:3,:4,:5,:6,:7,:8,:9,:10) RETURNING id INTO :11""",
                [data.cep, data.logradouro, data.numero, data.complemento,
                 data.bairro, data.cidade, data.estado, data.latitude, data.longitude, data.pais, out],
            )
            self.conn.commit()
            return int(out.getvalue()[0])

    def create_from_dict(self, d: dict) -> int:
        with self.conn.cursor() as cur:
            out = cur.var(oracledb.NUMBER)
            cur.execute(
                """INSERT INTO enderecos (cep, logradouro, numero, complemento, bairro, cidade, estado, pais)
                   VALUES (:1,:2,:3,:4,:5,:6,:7,:8) RETURNING id INTO :9""",
                [d.get("cep"), d.get("logradouro"), d.get("numero"), d.get("complemento"),
                 d.get("bairro"), d.get("cidade"), d.get("estado"), d.get("pais", "Brasil"), out],
            )
            self.conn.commit()
            return int(out.getvalue()[0])

    def update(self, eid: int, data):
        with self.conn.cursor() as cur:
            fields, params = [], {}
            for f in ("cep", "logradouro", "numero", "complemento", "bairro", "cidade", "estado", "latitude", "longitude", "pais"):
                v = getattr(data, f, None)
                if v is not None:
                    fields.append(f"{f} = :{f}")
                    params[f] = v
            if not fields:
                return False
            params["id"] = eid
            cur.execute(f"UPDATE enderecos SET {', '.join(fields)} WHERE id = :id", params)
            self.conn.commit()
            return cur.rowcount > 0

    def delete(self, eid: int):
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM enderecos WHERE id = :1", [eid])
            self.conn.commit()
            return cur.rowcount > 0
