from fastapi import HTTPException
import oracledb
from app.repositories.endereco_repository import EnderecoRepository


class EnderecoService:
    def __init__(self, db_conn: oracledb.Connection):
        self.repo = EnderecoRepository(db_conn)

    def get_all(self):
        return self.repo.get_all()

    def get_by_id(self, eid: int):
        e = self.repo.get_by_id(eid)
        if not e:
            raise HTTPException(status_code=404, detail="Endereço não encontrado")
        return e

    def create(self, data):
        return self.repo.create(data)

    def update(self, eid: int, data):
        self.get_by_id(eid)
        self.repo.update(eid, data)
        return self.get_by_id(eid)

    def delete(self, eid: int):
        self.get_by_id(eid)
        return self.repo.delete(eid)
