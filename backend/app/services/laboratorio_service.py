from fastapi import HTTPException
import oracledb
from app.repositories.laboratorio_repository import LaboratorioRepository


class LaboratorioService:
    def __init__(self, db_conn: oracledb.Connection):
        self.repo = LaboratorioRepository(db_conn)

    def get_all(self):
        return self.repo.get_all()

    def get_with_stats(self):
        return self.repo.get_with_stats()

    def get_by_id(self, lid: int):
        lab = self.repo.get_by_id(lid)
        if not lab:
            raise HTTPException(status_code=404, detail="Laboratório não encontrado")
        return lab

    def get_by_user(self, user_id: int):
        return self.repo.get_by_user(user_id)

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

    # Employees
    def get_usuarios(self, lab_id: int):
        return self.repo.get_usuarios(lab_id)

    def add_usuario(self, lab_id: int, usuario_id: int, papel: str, registro_crea=None):
        return self.repo.add_usuario(lab_id, usuario_id, papel, registro_crea)

    def remove_usuario(self, assoc_id: int):
        return self.repo.remove_usuario(assoc_id)

    # Phones
    def get_telefones(self, lab_id: int):
        return self.repo.get_telefones(lab_id)

    def add_telefone(self, lab_id: int, numero: str, tipo: str):
        return self.repo.add_telefone(lab_id, numero, tipo)
