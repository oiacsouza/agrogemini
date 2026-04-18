from fastapi import HTTPException
import oracledb
from app.repositories.importacao_repository import ImportacaoRepository


class ImportacaoService:
    def __init__(self, db_conn: oracledb.Connection):
        self.repo = ImportacaoRepository(db_conn)

    def get_all(self, lab_id: int | None = None, limit: int = 100):
        return self.repo.get_all(lab_id=lab_id, limit=limit)

    def get_by_id(self, iid: int):
        i = self.repo.get_by_id(iid)
        if not i:
            raise HTTPException(status_code=404, detail="Importação não encontrada")
        return i

    def create(self, data):
        new_id = self.repo.create(data)
        return self.get_by_id(new_id)

    def update(self, iid: int, data):
        self.get_by_id(iid)
        self.repo.update(iid, data)
        return self.get_by_id(iid)

    def delete(self, iid: int):
        self.get_by_id(iid)
        return self.repo.delete(iid)
