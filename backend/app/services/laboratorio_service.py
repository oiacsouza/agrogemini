import secrets

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.laboratorio import LaboratorioUsuario
from app.models.usuario import Usuario
from app.repositories.laboratorio_repository import LaboratorioRepository


class LaboratorioService:
    def __init__(self, db_session: AsyncSession):
        self.session = db_session
        self.repo = LaboratorioRepository(db_session)

    async def get_all(self):
        return await self.repo.get_all()

    async def get_with_stats(self):
        return await self.repo.get_with_stats()

    async def get_by_id(self, lid: int):
        lab = await self.repo.get_by_id(lid)
        if not lab:
            raise HTTPException(status_code=404, detail="Laboratório não encontrado")
        return lab

    async def get_by_user(self, user_id: int):
        return await self.repo.get_by_user(user_id)

    async def create(self, data):
        new_id = await self.repo.create(data)
        return await self.get_by_id(new_id)

    async def create_for_user(self, data, user_id: int, papel: str = "ADMINISTRADOR"):
        lab = await self.create(data)
        if getattr(lab, "usuario_id", None) is None:
            lab.usuario_id = user_id
            await self.session.commit()
        await self.add_usuario(lab.id, user_id, papel)
        return lab

    async def update(self, lid: int, data):
        await self.get_by_id(lid)
        await self.repo.update(lid, data)
        return await self.get_by_id(lid)

    async def delete(self, lid: int):
        await self.get_by_id(lid)
        return await self.repo.delete(lid)

    # Employees
    async def get_usuarios(self, lab_id: int):
        return await self.repo.get_usuarios(lab_id)

    async def add_usuario(self, lab_id: int, usuario_id: int, papel: str, registro_crea=None):
        return await self.repo.add_usuario(lab_id, usuario_id, papel)

    async def remove_usuario(self, lab_id: int, usuario_id: int):
        return await self.repo.remove_usuario(lab_id, usuario_id)

    # Phones
    async def get_telefones(self, lab_id: int):
        return await self.repo.get_telefones(lab_id)

    async def add_telefone(self, lab_id: int, numero: str, tipo: str):
        return await self.repo.add_telefone(lab_id, numero, tipo)

    # Clients
    async def get_clientes(self, lab_id: int):
        return await self.repo.get_clientes(lab_id)

    async def add_cliente(self, lab_id: int, usuario_id: int):
        await self.get_by_id(lab_id)
        return await self.repo.add_cliente(lab_id, usuario_id)

    async def create_or_link_cliente(
        self,
        lab_id: int,
        nome: str,
        sobrenome: str,
        email: str,
    ) -> dict:
        """Create a producer user and link it as a client of the lab.

        Client creation is intentionally simplified: the lab only informs
        name/email. The producer user receives a random password hash so no
        shared default password is created.
        """
        lab = await self.repo.get_by_id(lab_id)
        if not lab:
            raise HTTPException(status_code=404, detail="Laboratório não encontrado")

        normalized_email = (email or "").strip().lower()
        normalized_nome = (nome or "").strip()
        normalized_sobrenome = (sobrenome or "").strip() or " "

        if not normalized_nome or not normalized_email:
            raise HTTPException(status_code=422, detail="Nome e email do cliente são obrigatórios")

        try:
            result = await self.session.execute(
                select(Usuario).where(Usuario.email == normalized_email)
            )
            user = result.scalar_one_or_none()

            if user:
                if user.tipo_usuario.strip().upper() != "UE":
                    raise HTTPException(
                        status_code=400,
                        detail="Email já pertence a um usuário que não é produtor.",
                    )
                if user.ativo != "Y":
                    user.ativo = "Y"
            else:
                user = Usuario(
                    nome=normalized_nome,
                    sobrenome=normalized_sobrenome,
                    email=normalized_email,
                    senha_hash=hash_password(secrets.token_urlsafe(18)),
                    tipo_usuario="UE",
                    ativo="Y",
                    plano_ativo="FREE",
                )
                self.session.add(user)
                await self.session.flush()

            existing_link = await self.session.execute(
                select(LaboratorioUsuario)
                .where(LaboratorioUsuario.laboratorio_id == lab_id)
                .where(LaboratorioUsuario.usuario_id == user.id)
                .where(LaboratorioUsuario.papel == "CLIENTE")
            )
            if existing_link.scalar_one_or_none() is None:
                self.session.add(
                    LaboratorioUsuario(
                        laboratorio_id=lab_id,
                        usuario_id=user.id,
                        papel="CLIENTE",
                    )
                )
                await self.session.flush()

            response = {
                "id": user.id,
                "nome": user.nome,
                "sobrenome": user.sobrenome,
                "email": user.email,
                "tipo_usuario": user.tipo_usuario,
                "ativo": user.ativo,
                "total_laudos": 0,
                "ultimo_laudo": None,
            }
            await self.session.commit()
            return response
        except HTTPException:
            await self.session.rollback()
            raise
        except IntegrityError as exc:
            await self.session.rollback()
            message = str(exc)
            if "CK_LAB_USUARIOS_PAPEL" in message or "CLIENTE" in message:
                raise HTTPException(
                    status_code=500,
                    detail=(
                        "O banco ainda não aceita o papel CLIENTE em laboratorio_usuarios. "
                        "Execute a migração que inclui CLIENTE na constraint CK_LAB_USUARIOS_PAPEL."
                    ),
                )
            raise HTTPException(status_code=400, detail="Não foi possível cadastrar o cliente.")
        except SQLAlchemyError:
            await self.session.rollback()
            raise HTTPException(status_code=400, detail="Não foi possível cadastrar o cliente.")
