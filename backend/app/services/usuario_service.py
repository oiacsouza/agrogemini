from fastapi import HTTPException
import oracledb
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate


class UsuarioService:
    def __init__(self, db_conn: oracledb.Connection):
        self.repo = UsuarioRepository(db_conn)

    def get_usuarios(self):
        return self.repo.get_all()

    def get_usuario_by_id(self, user_id: int):
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        return user

    def get_usuarios_by_tipo(self, tipo: str):
        return self.repo.get_by_tipo(tipo)

    def create_usuario(self, user_data: UsuarioCreate):
        existing = self.repo.get_by_email(user_data.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email já cadastrado")
        new_id = self.repo.create(user_data)
        return self.get_usuario_by_id(new_id)

    def update_usuario(self, user_id: int, user_data: UsuarioUpdate):
        user = self.get_usuario_by_id(user_id)
        if user_data.email and user_data.email != user["email"]:
            existing = self.repo.get_by_email(user_data.email)
            if existing:
                raise HTTPException(status_code=400, detail="Email já cadastrado para outro usuário")
        self.repo.update(user_id, user_data)
        return self.get_usuario_by_id(user_id)

    def delete_usuario(self, user_id: int):
        self.get_usuario_by_id(user_id)
        success = self.repo.delete(user_id)
        if not success:
            raise HTTPException(status_code=500, detail="Não foi possível remover o usuário")
        return {"detail": "Usuário removido com sucesso"}
