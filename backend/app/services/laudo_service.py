from fastapi import HTTPException
import oracledb
from app.repositories.laudo_repository import LaudoRepository


class LaudoService:
    def __init__(self, db_conn: oracledb.Connection):
        self.repo = LaudoRepository(db_conn)

    def get_all(self, lab_id: int | None = None, limit: int = 100):
        return self.repo.get_all(lab_id=lab_id, limit=limit)

    def get_by_id(self, lid: int):
        l = self.repo.get_by_id(lid)
        if not l:
            raise HTTPException(status_code=404, detail="Laudo não encontrado")
        return l

    def get_by_amostra(self, amostra_id: int):
        return self.repo.get_by_amostra(amostra_id)

    def get_by_cliente(self, cliente_id: int):
        return self.repo.get_by_cliente(cliente_id)

    def create(self, data):
        new_id = self.repo.create(data)
        return self.get_by_id(new_id)

    def update(self, lid: int, data):
        self.get_by_id(lid)
        self.repo.update(lid, data)
        return self.get_by_id(lid)

    def delete(self, lid: int):
        self.get_by_id(lid)
        return self.repo.delete(lid)

    def get_resultados(self, laudo_id: int):
        return self.repo.get_resultados(laudo_id)

    def add_resultado(self, data):
        return self.repo.add_resultado(data)
