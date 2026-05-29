"""Testes – EnderecoService, ImportacaoService, UsuarioService, AuthService."""
import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException

from app.services.endereco_service import EnderecoService
from app.services.importacao_service import ImportacaoService
from app.services.usuario_service import UsuarioService
from app.services.auth_service import AuthService
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate


def _sess():
    s = AsyncMock()
    s.add = MagicMock()
    s.flush = AsyncMock()
    s.commit = AsyncMock()
    s.rollback = AsyncMock()
    return s


# ── EnderecoService ───────────────────────────────────────────────────────────
class TestEnderecoService:
    @pytest.mark.asyncio
    async def test_get_all(self):
        svc = EnderecoService(_sess())
        svc.repo.get_all = AsyncMock(return_value=[])
        assert await svc.get_all() == []

    @pytest.mark.asyncio
    async def test_get_by_id_found(self):
        svc = EnderecoService(_sess())
        e = MagicMock(id=1)
        svc.repo.get_by_id = AsyncMock(return_value=e)
        assert await svc.get_by_id(1) is e

    @pytest.mark.asyncio
    async def test_get_by_id_not_found(self):
        svc = EnderecoService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=None)
        with pytest.raises(HTTPException) as exc:
            await svc.get_by_id(99)
        assert exc.value.status_code == 404

    @pytest.mark.asyncio
    async def test_create(self):
        svc = EnderecoService(_sess())
        e = MagicMock(id=1)
        svc.repo.create = AsyncMock(return_value=1)
        svc.repo.get_by_id = AsyncMock(return_value=e)
        assert await svc.create(MagicMock()) is e

    @pytest.mark.asyncio
    async def test_update(self):
        svc = EnderecoService(_sess())
        e = MagicMock(id=1)
        svc.repo.get_by_id = AsyncMock(return_value=e)
        svc.repo.update = AsyncMock(return_value=True)
        assert await svc.update(1, MagicMock()) is e

    @pytest.mark.asyncio
    async def test_delete(self):
        svc = EnderecoService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        svc.repo.delete = AsyncMock(return_value=True)
        assert await svc.delete(1) is True


# ── ImportacaoService ─────────────────────────────────────────────────────────
class TestImportacaoService:
    @pytest.mark.asyncio
    async def test_get_all(self):
        svc = ImportacaoService(_sess())
        svc.repo.get_all = AsyncMock(return_value=[])
        assert await svc.get_all() == []

    @pytest.mark.asyncio
    async def test_get_all_with_lab(self):
        svc = ImportacaoService(_sess())
        svc.repo.get_all = AsyncMock(return_value=[])
        assert await svc.get_all(lab_id=1, limit=10) == []

    @pytest.mark.asyncio
    async def test_get_all_by_labs(self):
        svc = ImportacaoService(_sess())
        svc.repo.get_all_by_labs = AsyncMock(return_value=[])
        assert await svc.get_all_by_labs({1, 2}) == []

    @pytest.mark.asyncio
    async def test_get_by_id_found(self):
        svc = ImportacaoService(_sess())
        i = MagicMock(id=1)
        svc.repo.get_by_id = AsyncMock(return_value=i)
        assert await svc.get_by_id(1) is i

    @pytest.mark.asyncio
    async def test_get_by_id_not_found(self):
        svc = ImportacaoService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=None)
        with pytest.raises(HTTPException) as exc:
            await svc.get_by_id(99)
        assert exc.value.status_code == 404

    @pytest.mark.asyncio
    async def test_create(self):
        svc = ImportacaoService(_sess())
        i = MagicMock(id=1)
        svc.repo.create = AsyncMock(return_value=1)
        svc.repo.get_by_id = AsyncMock(return_value=i)
        assert await svc.create(MagicMock()) is i

    @pytest.mark.asyncio
    async def test_update(self):
        svc = ImportacaoService(_sess())
        i = MagicMock(id=1)
        svc.repo.get_by_id = AsyncMock(return_value=i)
        svc.repo.update = AsyncMock(return_value=True)
        assert await svc.update(1, MagicMock()) is i

    @pytest.mark.asyncio
    async def test_delete_success(self):
        svc = ImportacaoService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        svc.repo.delete = AsyncMock(return_value=True)
        r = await svc.delete(1)
        assert "removida" in r["detail"]

    @pytest.mark.asyncio
    async def test_delete_failure_raises_500(self):
        svc = ImportacaoService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        svc.repo.delete = AsyncMock(return_value=False)
        with pytest.raises(HTTPException) as exc:
            await svc.delete(1)
        assert exc.value.status_code == 500


# ── UsuarioService ────────────────────────────────────────────────────────────
class TestUsuarioService:
    @pytest.mark.asyncio
    async def test_get_all(self):
        svc = UsuarioService(_sess())
        svc.repo.get_all = AsyncMock(return_value=[])
        assert await svc.get_all() == []

    @pytest.mark.asyncio
    async def test_get_usuarios(self):
        svc = UsuarioService(_sess())
        svc.repo.get_all = AsyncMock(return_value=[])
        assert await svc.get_usuarios() == []

    @pytest.mark.asyncio
    async def test_get_by_id_found(self):
        svc = UsuarioService(_sess())
        u = MagicMock(id=1)
        svc.repo.get_by_id = AsyncMock(return_value=u)
        assert await svc.get_by_id(1) is u

    @pytest.mark.asyncio
    async def test_get_by_id_not_found(self):
        svc = UsuarioService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=None)
        with pytest.raises(HTTPException) as exc:
            await svc.get_by_id(99)
        assert exc.value.status_code == 404

    @pytest.mark.asyncio
    async def test_get_usuarios_by_tipo(self):
        svc = UsuarioService(_sess())
        svc.repo.get_by_tipo = AsyncMock(return_value=[])
        assert await svc.get_usuarios_by_tipo("UE") == []

    @pytest.mark.asyncio
    async def test_create_usuario_new_email(self):
        svc = UsuarioService(_sess())
        u = MagicMock(id=1)
        svc.repo.get_by_email = AsyncMock(return_value=None)
        svc.repo.create = AsyncMock(return_value=1)
        svc.repo.get_by_id = AsyncMock(return_value=u)
        data = MagicMock(spec=UsuarioCreate, email="novo@test.com")
        assert await svc.create(data) is u

    @pytest.mark.asyncio
    async def test_create_usuario_duplicate_email_raises_400(self):
        svc = UsuarioService(_sess())
        svc.repo.get_by_email = AsyncMock(return_value=MagicMock())
        data = MagicMock(spec=UsuarioCreate, email="dup@test.com")
        with pytest.raises(HTTPException) as exc:
            await svc.create(data)
        assert exc.value.status_code == 400

    @pytest.mark.asyncio
    async def test_update_usuario_same_email(self):
        svc = UsuarioService(_sess())
        u = MagicMock(id=1, email="same@test.com")
        svc.repo.get_by_id = AsyncMock(return_value=u)
        svc.repo.update = AsyncMock(return_value=True)
        data = MagicMock(spec=UsuarioUpdate, email="same@test.com")
        assert await svc.update(1, data) is u

    @pytest.mark.asyncio
    async def test_update_usuario_new_email_taken(self):
        svc = UsuarioService(_sess())
        u = MagicMock(id=1, email="old@test.com")
        svc.repo.get_by_id = AsyncMock(return_value=u)
        svc.repo.get_by_email = AsyncMock(return_value=MagicMock())
        data = MagicMock(spec=UsuarioUpdate, email="taken@test.com")
        with pytest.raises(HTTPException) as exc:
            await svc.update(1, data)
        assert exc.value.status_code == 400

    @pytest.mark.asyncio
    async def test_update_usuario_new_email_free(self):
        svc = UsuarioService(_sess())
        u = MagicMock(id=1, email="old@test.com")
        svc.repo.get_by_id = AsyncMock(return_value=u)
        svc.repo.get_by_email = AsyncMock(return_value=None)
        svc.repo.update = AsyncMock(return_value=True)
        data = MagicMock(spec=UsuarioUpdate, email="new@test.com")
        assert await svc.update(1, data) is u

    @pytest.mark.asyncio
    async def test_delete_usuario_success(self):
        svc = UsuarioService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        svc.repo.delete = AsyncMock(return_value=True)
        r = await svc.delete(1)
        assert "removido" in r["detail"]

    @pytest.mark.asyncio
    async def test_delete_usuario_failure_raises_500(self):
        svc = UsuarioService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        svc.repo.delete = AsyncMock(return_value=False)
        with pytest.raises(HTTPException) as exc:
            await svc.delete(1)
        assert exc.value.status_code == 500


# ── AuthService ───────────────────────────────────────────────────────────────
class TestAuthService:
    @pytest.mark.asyncio
    async def test_login_user_not_found(self):
        svc = AuthService(_sess())
        svc.user_repo.get_by_email_with_password = AsyncMock(return_value=None)
        data = MagicMock(email="x@x.com", senha="123")
        with pytest.raises(HTTPException) as exc:
            await svc.login(data)
        assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_login_wrong_password(self):
        svc = AuthService(_sess())
        user = MagicMock(senha_hash="$2b$12$invalid", ativo="Y")
        svc.user_repo.get_by_email_with_password = AsyncMock(return_value=user)
        data = MagicMock(email="x@x.com", senha="wrong")
        with pytest.raises(HTTPException) as exc:
            await svc.login(data)
        assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_login_inactive_user(self):
        from app.core.security import hash_password
        svc = AuthService(_sess())
        user = MagicMock(senha_hash=hash_password("Senha123!"), ativo="N")
        svc.user_repo.get_by_email_with_password = AsyncMock(return_value=user)
        data = MagicMock(email="x@x.com", senha="Senha123!")
        with pytest.raises(HTTPException) as exc:
            await svc.login(data)
        assert exc.value.status_code == 403

    @pytest.mark.asyncio
    async def test_login_success(self):
        from app.core.security import hash_password
        svc = AuthService(_sess())
        user = MagicMock(
            id=1, nome="A", sobrenome="B", email="a@b.com",
            tipo_usuario="ADM", ativo="Y", senha_hash=hash_password("Senha123!"),
        )
        svc.user_repo.get_by_email_with_password = AsyncMock(return_value=user)
        svc.user_repo.update_ultimo_acesso = AsyncMock()
        svc.user_repo.get_user_plan = AsyncMock(return_value="PREMIUM")
        data = MagicMock(email="a@b.com", senha="Senha123!")
        result = await svc.login(data)
        assert result.access_token

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self):
        svc = AuthService(_sess())
        svc.user_repo.get_by_email = AsyncMock(return_value=MagicMock())
        data = MagicMock(email="dup@test.com")
        with pytest.raises(HTTPException) as exc:
            await svc.register(data)
        assert exc.value.status_code == 400

    @pytest.mark.asyncio
    async def test_register_ue_user(self):
        svc = AuthService(_sess())
        svc.user_repo.get_by_email = AsyncMock(return_value=None)
        svc.user_repo.create_raw = AsyncMock(return_value=5)
        data = MagicMock(
            nome="João", sobrenome="Silva", email="j@s.com",
            senha="Senha123!", tipo_usuario="producer",
            cep=None, logradouro=None, numero=None,
            bairro=None, cidade=None, estado=None,
        )
        result = await svc.register(data)
        assert result.user_id == 5
        assert result.tipo_usuario == "UE"

    @pytest.mark.asyncio
    async def test_register_up_user_creates_lab(self):
        svc = AuthService(_sess())
        svc.user_repo.get_by_email = AsyncMock(return_value=None)
        svc.user_repo.create_raw = AsyncMock(return_value=10)
        data = MagicMock(
            nome="Lab", sobrenome="Owner", email="lab@test.com",
            senha="Senha123!", tipo_usuario="lab",
            cep=None, logradouro=None, numero=None,
            bairro=None, cidade=None, estado=None,
        )
        # flush/add needed for lab creation
        result = await svc.register(data)
        assert result.tipo_usuario == "UP"

    @pytest.mark.asyncio
    async def test_register_unknown_tipo_defaults_to_uc(self):
        svc = AuthService(_sess())
        svc.user_repo.get_by_email = AsyncMock(return_value=None)
        svc.user_repo.create_raw = AsyncMock(return_value=3)
        data = MagicMock(
            nome="X", sobrenome="Y", email="xy@test.com",
            senha="Senha123!", tipo_usuario="UNKNOWN",
            cep=None, logradouro=None, numero=None,
            bairro=None, cidade=None, estado=None,
        )
        result = await svc.register(data)
        assert result.tipo_usuario == "UC"
