import oracledb


class AmostraRepository:
    def __init__(self, connection: oracledb.Connection):
        self.conn = connection

    def _rf(self, cur):
        cur.rowfactory = lambda *a: dict(zip([d[0].lower() for d in cur.description], a))

    def get_all(self, lab_id: int | None = None, limit: int = 100):
        with self.conn.cursor() as cur:
            self._rf(cur)
            where = "WHERE a.laboratorio_id = :lab_id" if lab_id else ""
            params = {"lab_id": lab_id} if lab_id else {}
            cur.execute(
                f"""SELECT a.*,
                       u.nome || ' ' || u.sobrenome AS cliente_nome,
                       t.identificacao AS talhao_identificacao,
                       f.nome AS fazenda_nome
                   FROM amostras a
                   LEFT JOIN usuarios u ON u.id = a.cliente_id
                   LEFT JOIN talhoes t ON t.id = a.talhao_id
                   LEFT JOIN fazendas f ON f.id = t.fazenda_id
                   {where}
                   ORDER BY a.criado_em DESC
                   FETCH FIRST :lim ROWS ONLY""",
                {**params, "lim": limit},
            )
            return cur.fetchall()

    def get_by_id(self, aid: int):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute(
                """SELECT a.*,
                       u.nome || ' ' || u.sobrenome AS cliente_nome,
                       t.identificacao AS talhao_identificacao,
                       f.nome AS fazenda_nome
                   FROM amostras a
                   LEFT JOIN usuarios u ON u.id = a.cliente_id
                   LEFT JOIN talhoes t ON t.id = a.talhao_id
                   LEFT JOIN fazendas f ON f.id = t.fazenda_id
                   WHERE a.id = :1""",
                [aid],
            )
            return cur.fetchone()

    def get_by_cliente(self, cliente_id: int):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute(
                """SELECT a.*, t.identificacao AS talhao_identificacao, f.nome AS fazenda_nome
                   FROM amostras a
                   LEFT JOIN talhoes t ON t.id = a.talhao_id
                   LEFT JOIN fazendas f ON f.id = t.fazenda_id
                   WHERE a.cliente_id = :1 ORDER BY a.criado_em DESC""",
                [cliente_id],
            )
            return cur.fetchall()

    def create(self, data) -> int:
        with self.conn.cursor() as cur:
            out = cur.var(oracledb.NUMBER)
            cur.execute(
                """INSERT INTO amostras (talhao_id, cliente_id, laboratorio_id, importacao_id,
                   codigo_interno, codigo_barras, tipo_amostra, descricao, lote, tonelada,
                   metodo_extracao, data_coleta, data_entrada, data_saida, status, prioridade)
                   VALUES (:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14,:15,:16) RETURNING id INTO :17""",
                [data.talhao_id, data.cliente_id, data.laboratorio_id,
                 getattr(data, "importacao_id", None),
                 data.codigo_interno, getattr(data, "codigo_barras", None),
                 data.tipo_amostra, getattr(data, "descricao", None),
                 getattr(data, "lote", None), getattr(data, "tonelada", None),
                 getattr(data, "metodo_extracao", None), getattr(data, "data_coleta", None),
                 data.data_entrada, getattr(data, "data_saida", None),
                 data.status, data.prioridade, out],
            )
            self.conn.commit()
            return int(out.getvalue()[0])

    def update(self, aid: int, data):
        with self.conn.cursor() as cur:
            fields, params = [], {}
            for f in ("status", "prioridade", "data_saida", "descricao", "lote", "tonelada", "metodo_extracao", "codigo_barras"):
                v = getattr(data, f, None)
                if v is not None:
                    fields.append(f"{f} = :{f}")
                    params[f] = v
            if not fields:
                return False
            params["id"] = aid
            cur.execute(f"UPDATE amostras SET {', '.join(fields)} WHERE id = :id", params)
            self.conn.commit()
            return cur.rowcount > 0

    def delete(self, aid: int):
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM amostras WHERE id = :1", [aid])
            self.conn.commit()
            return cur.rowcount > 0

    # ── Aggregations ──────────────────────────────────────────────────────────

    def count_by_lab(self, lab_id: int) -> int:
        with self.conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM amostras WHERE laboratorio_id = :1", [lab_id])
            return cur.fetchone()[0]

    def count_by_status(self, lab_id: int, statuses: list[str]) -> int:
        with self.conn.cursor() as cur:
            placeholders = ",".join(f":{i}" for i in range(len(statuses)))
            params = {str(i): s for i, s in enumerate(statuses)}
            params["lab"] = lab_id
            cur.execute(
                f"SELECT COUNT(*) FROM amostras WHERE laboratorio_id = :lab AND status IN ({placeholders})",
                params,
            )
            return cur.fetchone()[0]

    def count_today(self, lab_id: int) -> int:
        with self.conn.cursor() as cur:
            cur.execute(
                """SELECT COUNT(*) FROM amostras
                   WHERE laboratorio_id = :1
                   AND TRUNC(criado_em) = TRUNC(SYSTIMESTAMP)""",
                [lab_id],
            )
            return cur.fetchone()[0]

    def monthly_trend(self, lab_id: int, months: int = 6):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute(
                """SELECT TO_CHAR(TRUNC(data_entrada, 'MONTH'), 'YYYY-MM') AS month,
                          COUNT(*) AS samples
                   FROM amostras
                   WHERE laboratorio_id = :1
                   AND data_entrada >= ADD_MONTHS(TRUNC(SYSDATE, 'MONTH'), -:2)
                   GROUP BY TRUNC(data_entrada, 'MONTH')
                   ORDER BY TRUNC(data_entrada, 'MONTH')""",
                [lab_id, months],
            )
            return cur.fetchall()
