import oracledb


class TalhaoRepository:
    def __init__(self, connection: oracledb.Connection):
        self.conn = connection

    def _rf(self, cur):
        cur.rowfactory = lambda *a: dict(zip([d[0].lower() for d in cur.description], a))

    def get_all(self):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute("SELECT * FROM talhoes ORDER BY id DESC")
            return cur.fetchall()

    def get_by_fazenda(self, fazenda_id: int):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute("SELECT * FROM talhoes WHERE fazenda_id = :1 ORDER BY identificacao", [fazenda_id])
            return cur.fetchall()

    def get_by_id(self, tid: int):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute("SELECT * FROM talhoes WHERE id = :1", [tid])
            return cur.fetchone()

    def create(self, data) -> int:
        with self.conn.cursor() as cur:
            out = cur.var(oracledb.NUMBER)
            cur.execute(
                """INSERT INTO talhoes (fazenda_id, identificacao, tipo_plantio, area,
                   profundidade_amostragem_cm, textura_solo, bioma, latitude_centroide, longitude_centroide)
                   VALUES (:1,:2,:3,:4,:5,:6,:7,:8,:9) RETURNING id INTO :10""",
                [data.fazenda_id, data.identificacao, data.tipo_plantio, data.area,
                 data.profundidade_amostragem_cm, data.textura_solo, data.bioma,
                 data.latitude_centroide, data.longitude_centroide, out],
            )
            self.conn.commit()
            return int(out.getvalue()[0])

    def update(self, tid: int, data):
        with self.conn.cursor() as cur:
            fields, params = [], {}
            for f in ("identificacao", "tipo_plantio", "area", "profundidade_amostragem_cm", "textura_solo", "bioma", "latitude_centroide", "longitude_centroide"):
                v = getattr(data, f, None)
                if v is not None:
                    fields.append(f"{f} = :{f}")
                    params[f] = v
            if not fields:
                return False
            params["id"] = tid
            cur.execute(f"UPDATE talhoes SET {', '.join(fields)} WHERE id = :id", params)
            self.conn.commit()
            return cur.rowcount > 0

    def delete(self, tid: int):
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM talhoes WHERE id = :1", [tid])
            self.conn.commit()
            return cur.rowcount > 0
