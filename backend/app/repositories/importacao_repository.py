import oracledb


class ImportacaoRepository:
    def __init__(self, connection: oracledb.Connection):
        self.conn = connection

    def _rf(self, cur):
        cur.rowfactory = lambda *a: dict(zip([d[0].lower() for d in cur.description], a))

    def get_all(self, lab_id: int | None = None, limit: int = 100):
        with self.conn.cursor() as cur:
            self._rf(cur)
            where = "WHERE laboratorio_id = :lab_id" if lab_id else ""
            params = {"lab_id": lab_id, "lim": limit} if lab_id else {"lim": limit}
            cur.execute(f"SELECT * FROM importacoes {where} ORDER BY criado_em DESC FETCH FIRST :lim ROWS ONLY", params)
            return cur.fetchall()

    def get_by_id(self, iid: int):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute("SELECT * FROM importacoes WHERE id = :1", [iid])
            return cur.fetchone()

    def create(self, data) -> int:
        with self.conn.cursor() as cur:
            out = cur.var(oracledb.NUMBER)
            cur.execute(
                """INSERT INTO importacoes (laboratorio_id, usuario_id, nome_arquivo, tipo_arquivo,
                   formato_instrumento, caminho_arquivo, hash_arquivo, status, total_registros, registros_processados)
                   VALUES (:1,:2,:3,:4,:5,:6,:7,:8,:9,:10) RETURNING id INTO :11""",
                [data.laboratorio_id, data.usuario_id, data.nome_arquivo, data.tipo_arquivo,
                 getattr(data, "formato_instrumento", None), data.caminho_arquivo, data.hash_arquivo,
                 data.status, getattr(data, "total_registros", 0),
                 getattr(data, "registros_processados", 0), out],
            )
            self.conn.commit()
            return int(out.getvalue()[0])

    def update(self, iid: int, data):
        with self.conn.cursor() as cur:
            fields, params = [], {}
            for f in ("status", "mensagem_erro", "total_registros", "registros_processados", "processado_em"):
                v = getattr(data, f, None)
                if v is not None:
                    fields.append(f"{f} = :{f}")
                    params[f] = v
            if not fields:
                return False
            params["id"] = iid
            cur.execute(f"UPDATE importacoes SET {', '.join(fields)} WHERE id = :id", params)
            self.conn.commit()
            return cur.rowcount > 0

    def delete(self, iid: int):
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM importacoes WHERE id = :1", [iid])
            self.conn.commit()
            return cur.rowcount > 0
