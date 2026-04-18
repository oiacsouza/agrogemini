from fastapi import HTTPException
import oracledb
from app.repositories.amostra_repository import AmostraRepository


class AmostraService:
    def __init__(self, db_conn: oracledb.Connection):
        self.repo = AmostraRepository(db_conn)

    def get_all(self, lab_id: int | None = None, limit: int = 100):
        return self.repo.get_all(lab_id=lab_id, limit=limit)

    def get_by_id(self, aid: int):
        a = self.repo.get_by_id(aid)
        if not a:
            raise HTTPException(status_code=404, detail="Amostra não encontrada")
        return a

    def get_by_cliente(self, cliente_id: int):
        return self.repo.get_by_cliente(cliente_id)

    def create(self, data):
        new_id = self.repo.create(data)
        return self.get_by_id(new_id)

    def update(self, aid: int, data):
        self.get_by_id(aid)
        self.repo.update(aid, data)
        return self.get_by_id(aid)

    def delete(self, aid: int):
        self.get_by_id(aid)
        return self.repo.delete(aid)
