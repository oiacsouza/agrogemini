import oracledb


class LaudoRepository:
    def __init__(self, connection: oracledb.Connection):
        self.conn = connection

    def _rf(self, cur):
        cur.rowfactory = lambda *a: dict(zip([d[0].lower() for d in cur.description], a))

    def get_all(self, lab_id: int | None = None, limit: int = 100):
        with self.conn.cursor() as cur:
            self._rf(cur)
            where = "WHERE laboratorio_id = :lab_id" if lab_id else ""
            params = {"lab_id": lab_id, "lim": limit} if lab_id else {"lim": limit}
            cur.execute(f"SELECT * FROM laudos {where} ORDER BY criado_em DESC FETCH FIRST :lim ROWS ONLY", params)
            return cur.fetchall()

    def get_by_id(self, lid: int):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute("SELECT * FROM laudos WHERE id = :1", [lid])
            return cur.fetchone()

    def get_by_amostra(self, amostra_id: int):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute("SELECT * FROM laudos WHERE amostra_id = :1 ORDER BY criado_em DESC", [amostra_id])
            return cur.fetchall()

    def get_by_cliente(self, cliente_id: int):
        """Get laudos for a specific client (via amostras.cliente_id)."""
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute(
                """SELECT l.*, a.codigo_interno AS amostra_codigo,
                          t.identificacao AS talhao_nome, f.nome AS fazenda_nome
                   FROM laudos l
                   JOIN amostras a ON a.id = l.amostra_id
                   LEFT JOIN talhoes t ON t.id = a.talhao_id
                   LEFT JOIN fazendas f ON f.id = t.fazenda_id
                   WHERE a.cliente_id = :1
                   ORDER BY l.data_emissao DESC""",
                [cliente_id],
            )
            return cur.fetchall()

    def create(self, data) -> int:
        with self.conn.cursor() as cur:
            out = cur.var(oracledb.NUMBER)
            cur.execute(
                """INSERT INTO laudos (amostra_id, laboratorio_id, responsavel_id, tipo_laudo,
                   numero_pedido, numero_laudo, solicitante_nome, razao_social, propriedade, cidade,
                   data_entrada, data_saida, data_emissao, status, pdf_path, hash_autenticacao,
                   observacoes, responsavel_tecnico_nome, responsavel_tecnico_registro, credenciamento_mapa)
                   VALUES (:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14,:15,:16,:17,:18,:19,:20)
                   RETURNING id INTO :21""",
                [data.amostra_id, data.laboratorio_id, getattr(data, "responsavel_id", None),
                 data.tipo_laudo, getattr(data, "numero_pedido", None), data.numero_laudo,
                 getattr(data, "solicitante_nome", None), getattr(data, "razao_social", None),
                 getattr(data, "propriedade", None), getattr(data, "cidade", None),
                 getattr(data, "data_entrada", None), getattr(data, "data_saida", None),
                 data.data_emissao, data.status,
                 getattr(data, "pdf_path", None), getattr(data, "hash_autenticacao", None),
                 getattr(data, "observacoes", None), getattr(data, "responsavel_tecnico_nome", None),
                 getattr(data, "responsavel_tecnico_registro", None), getattr(data, "credenciamento_mapa", None),
                 out],
            )
            self.conn.commit()
            return int(out.getvalue()[0])

    def update(self, lid: int, data):
        with self.conn.cursor() as cur:
            fields, params = [], {}
            for f in ("status", "data_saida", "pdf_path", "hash_autenticacao", "observacoes", "responsavel_tecnico_nome", "responsavel_tecnico_registro"):
                v = getattr(data, f, None)
                if v is not None:
                    fields.append(f"{f} = :{f}")
                    params[f] = v
            if not fields:
                return False
            params["id"] = lid
            cur.execute(f"UPDATE laudos SET {', '.join(fields)} WHERE id = :id", params)
            self.conn.commit()
            return cur.rowcount > 0

    def delete(self, lid: int):
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM laudos WHERE id = :1", [lid])
            self.conn.commit()
            return cur.rowcount > 0

    def count_by_lab(self, lab_id: int) -> int:
        with self.conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM laudos WHERE laboratorio_id = :1", [lab_id])
            return cur.fetchone()[0]

    # ── Resultados ────────────────────────────────────────────────────────────

    def get_resultados(self, laudo_id: int):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute("SELECT * FROM laudo_resultados WHERE laudo_id = :1 ORDER BY ordem_exibicao", [laudo_id])
            return cur.fetchall()

    def add_resultado(self, data) -> int:
        with self.conn.cursor() as cur:
            out = cur.var(oracledb.NUMBER)
            cur.execute(
                """INSERT INTO laudo_resultados (laudo_id, configuracao_id, parametro, unidade, garantia,
                   resultado, resultado_convertido, unidade_convertida, classe_interpretativa, ordem_exibicao, fora_spec)
                   VALUES (:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11) RETURNING id INTO :12""",
                [data.laudo_id, getattr(data, "configuracao_id", None), data.parametro,
                 getattr(data, "unidade", None), getattr(data, "garantia", None),
                 getattr(data, "resultado", None), getattr(data, "resultado_convertido", None),
                 getattr(data, "unidade_convertida", None), getattr(data, "classe_interpretativa", None),
                 data.ordem_exibicao, data.fora_spec, out],
            )
            self.conn.commit()
            return int(out.getvalue()[0])
