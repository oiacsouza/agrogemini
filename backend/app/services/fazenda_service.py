from fastapi import HTTPException
import oracledb
from app.repositories.fazenda_repository import FazendaRepository
from app.repositories.talhao_repository import TalhaoRepository


class FazendaService:
    def __init__(self, db_conn: oracledb.Connection):
        self.repo = FazendaRepository(db_conn)
        self.talhao_repo = TalhaoRepository(db_conn)

    def get_all(self):
        return self.repo.get_all()

    def get_by_id(self, fid: int):
        f = self.repo.get_by_id(fid)
        if not f:
            raise HTTPException(status_code=404, detail="Fazenda não encontrada")
        return f

    def create(self, data):
        new_id = self.repo.create(data)
        return self.get_by_id(new_id)

    def update(self, fid: int, data):
        self.get_by_id(fid)
        self.repo.update(fid, data)
        return self.get_by_id(fid)

    def delete(self, fid: int):
        self.get_by_id(fid)
        return self.repo.delete(fid)

    def get_talhoes(self, fazenda_id: int):
        return self.talhao_repo.get_by_fazenda(fazenda_id)

    def get_usuarios(self, fazenda_id: int):
        return self.repo.get_usuarios(fazenda_id)

    def add_usuario(self, data):
        return self.repo.add_usuario(data)
