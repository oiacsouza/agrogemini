import oracledb


class LaboratorioRepository:
    def __init__(self, connection: oracledb.Connection):
        self.conn = connection

    def _rf(self, cur):
        cur.rowfactory = lambda *a: dict(zip([d[0].lower() for d in cur.description], a))

    def get_all(self):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute("SELECT * FROM laboratorios ORDER BY id")
            return cur.fetchall()

    def get_by_id(self, lid: int):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute("SELECT * FROM laboratorios WHERE id = :1", [lid])
            return cur.fetchone()

    def get_by_user(self, user_id: int):
        """Get labs the user is associated with."""
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute(
                """SELECT l.* FROM laboratorios l
                   JOIN laboratorio_usuarios lu ON lu.laboratorio_id = l.id
                   WHERE lu.usuario_id = :1 ORDER BY l.id""",
                [user_id],
            )
            return cur.fetchall()

    def get_with_stats(self):
        """Return all labs with employee count and sample count."""
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute(
                """SELECT l.*,
                    (SELECT COUNT(*) FROM laboratorio_usuarios lu WHERE lu.laboratorio_id = l.id) AS total_funcionarios,
                    (SELECT COUNT(*) FROM amostras a WHERE a.laboratorio_id = l.id) AS total_amostras,
                    (SELECT e.cidade FROM enderecos e WHERE e.id = l.endereco_id) AS cidade_endereco,
                    (SELECT e.estado FROM enderecos e WHERE e.id = l.endereco_id) AS estado_endereco
                   FROM laboratorios l ORDER BY l.id"""
            )
            return cur.fetchall()

    def create(self, data) -> int:
        with self.conn.cursor() as cur:
            out = cur.var(oracledb.NUMBER)
            cur.execute(
                """INSERT INTO laboratorios (nome, cnpj, endereco_id, email, ativo, acreditacao_iso17025 , registro_renasem, credenciamento_mapa)
                   VALUES (:1,:2,:3,:4,:5,:6,:7,:8) RETURNING id INTO :9""",
                [data.nome, data.cnpj, data.endereco_id, data.email, data.ativo,
                 data.acreditacao_iso17025, data.registro_renasem, data.credenciamento_mapa, out],
            )
            self.conn.commit()
            return int(out.getvalue()[0])

    def update(self, lid: int, data):
        with self.conn.cursor() as cur:
            fields, params = [], {}
            for f in ("nome", "cnpj", "email", "ativo", "acreditacao_iso17025", "registro_renasem", "credenciamento_mapa", "endereco_id"):
                v = getattr(data, f, None)
                if v is not None:
                    fields.append(f"{f} = :{f}")
                    params[f] = v
            if not fields:
                return False
            params["id"] = lid
            cur.execute(f"UPDATE laboratorios SET {', '.join(fields)} WHERE id = :id", params)
            self.conn.commit()
            return cur.rowcount > 0

    def delete(self, lid: int):
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM laboratorios WHERE id = :1", [lid])
            self.conn.commit()
            return cur.rowcount > 0

    # ── Lab Users ─────────────────────────────────────────────────────────────

    def get_usuarios(self, lab_id: int):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute(
                """SELECT lu.id, lu.laboratorio_id, lu.usuario_id, lu.papel, lu.registro_crea,
                          u.nome AS usuario_nome, u.sobrenome AS usuario_sobrenome,
                          u.email AS usuario_email, u.ativo AS usuario_ativo
                   FROM laboratorio_usuarios lu
                   JOIN usuarios u ON u.id = lu.usuario_id
                   WHERE lu.laboratorio_id = :1 ORDER BY u.nome""",
                [lab_id],
            )
            return cur.fetchall()

    def add_usuario(self, lab_id: int, usuario_id: int, papel: str, registro_crea=None) -> int:
        with self.conn.cursor() as cur:
            out = cur.var(oracledb.NUMBER)
            cur.execute(
                """INSERT INTO laboratorio_usuarios (laboratorio_id, usuario_id, papel, registro_crea)
                   VALUES (:1,:2,:3,:4) RETURNING id INTO :5""",
                [lab_id, usuario_id, papel, registro_crea, out],
            )
            self.conn.commit()
            return int(out.getvalue()[0])

    def remove_usuario(self, assoc_id: int):
        with self.conn.cursor() as cur:
            cur.execute("DELETE FROM laboratorio_usuarios WHERE id = :1", [assoc_id])
            self.conn.commit()
            return cur.rowcount > 0

    # ── Lab Phones ────────────────────────────────────────────────────────────

    def get_telefones(self, lab_id: int):
        with self.conn.cursor() as cur:
            self._rf(cur)
            cur.execute("SELECT * FROM telefones_laboratorios WHERE laboratorio_id = :1", [lab_id])
            return cur.fetchall()

    def add_telefone(self, lab_id: int, numero: str, tipo: str) -> int:
        with self.conn.cursor() as cur:
            out = cur.var(oracledb.NUMBER)
            cur.execute(
                """INSERT INTO telefones_laboratorios (laboratorio_id, numero, tipo)
                   VALUES (:1,:2,:3) RETURNING id INTO :4""",
                [lab_id, numero, tipo, out],
            )
            self.conn.commit()
            return int(out.getvalue()[0])
