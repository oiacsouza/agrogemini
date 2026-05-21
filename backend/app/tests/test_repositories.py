"""
Testes – Repositórios (UsuarioRepository, FazendaRepository, e demais)
usando AsyncSession completamente mockada.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import date

from app.repositories.usuario_repository import UsuarioRepository
from app.repositories.fazenda_repository import FazendaRepository


def _sess():
    s = AsyncMock()
    s.add = MagicMock()
    s.flush = AsyncMock()
    s.commit = AsyncMock()
    s.rollback = AsyncMock()
    return s


def _result_scalars(items):
    r = MagicMock()
    r.scalars.return_value.all.return_value = items
    return r


def _result_scalar_one_or_none(value):
    r = MagicMock()
    r.scalar_one_or_none.return_value = value
    return r


def _result_scalar_one(value):
    r = MagicMock()
    r.scalar_one.return_value = value
    return r


def _result_rowcount(count):
    r = MagicMock()
    r.rowcount = count
    return r


# ── UsuarioRepository ─────────────────────────────────────────────────────────
class TestUsuarioRepository:
    @pytest.mark.asyncio
    async def test_get_all(self):
        sess = _sess()
        sess.execute = AsyncMock(return_value=_result_scalars([]))
        repo = UsuarioRepository(sess)
        assert await repo.get_all() == []

    @pytest.mark.asyncio
    async def test_get_by_id_found(self):
        sess = _sess()
        u = MagicMock(id=1)
        sess.execute = AsyncMock(return_value=_result_scalar_one_or_none(u))
        repo = UsuarioRepository(sess)
        assert await repo.get_by_id(1) is u

    @pytest.mark.asyncio
    async def test_get_by_id_not_found(self):
        sess = _sess()
        sess.execute = AsyncMock(return_value=_result_scalar_one_or_none(None))
        repo = UsuarioRepository(sess)
        assert await repo.get_by_id(99) is None

    @pytest.mark.asyncio
    async def test_get_by_email(self):
        sess = _sess()
        u = MagicMock(email="a@b.com")
        sess.execute = AsyncMock(return_value=_result_scalar_one_or_none(u))
        repo = UsuarioRepository(sess)
        assert await repo.get_by_email("a@b.com") is u

    @pytest.mark.asyncio
    async def test_get_by_email_with_password(self):
        """Delegates to get_by_email."""
        sess = _sess()
        u = MagicMock(email="a@b.com")
        sess.execute = AsyncMock(return_value=_result_scalar_one_or_none(u))
        repo = UsuarioRepository(sess)
        assert await repo.get_by_email_with_password("a@b.com") is u

    @pytest.mark.asyncio
    async def test_get_by_tipo(self):
        sess = _sess()
        sess.execute = AsyncMock(return_value=_result_scalars([]))
        repo = UsuarioRepository(sess)
        assert await repo.get_by_tipo("UE") == []

    @pytest.mark.asyncio
    async def test_create_raw(self):
        sess = _sess()
        new_user = MagicMock(id=42)
        def add_side_effect(obj):
            obj.id = 42
        sess.add = MagicMock(side_effect=add_side_effect)
        repo = UsuarioRepository(sess)
        with MagicMock() as _:
            from app.models.usuario import Usuario
            # patch Usuario constructor to return our mock
            with pytest.MonkeyPatch().context() as mp:
                mp.setattr(
                    "app.repositories.usuario_repository.Usuario",
                    lambda **kwargs: new_user,
                )
                result = await repo.create_raw(
                    "João", "Silva", "j@s.com", "hash", "UE", "Y"
                )
        assert result == 42

    @pytest.mark.asyncio
    async def test_update_with_data(self):
        sess = _sess()
        sess.execute = AsyncMock(return_value=_result_rowcount(1))
        repo = UsuarioRepository(sess)
        update_data = MagicMock()
        update_data.model_dump.return_value = {"nome": "Novo Nome"}
        assert await repo.update(1, update_data) is True

    @pytest.mark.asyncio
    async def test_update_no_data(self):
        sess = _sess()
        repo = UsuarioRepository(sess)
        update_data = MagicMock()
        update_data.model_dump.return_value = {}
        assert await repo.update(1, update_data) is False

    @pytest.mark.asyncio
    async def test_update_with_senha(self):
        sess = _sess()
        sess.execute = AsyncMock(return_value=_result_rowcount(1))
        repo = UsuarioRepository(sess)
        update_data = MagicMock()
        update_data.model_dump.return_value = {"senha": "NovaSenha123!"}
        result = await repo.update(1, update_data)
        assert result is True

    @pytest.mark.asyncio
    async def test_update_ultimo_acesso(self):
        sess = _sess()
        sess.execute = AsyncMock(return_value=MagicMock())
        repo = UsuarioRepository(sess)
        await repo.update_ultimo_acesso(1)
        sess.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_found(self):
        sess = _sess()
        sess.execute = AsyncMock(return_value=_result_rowcount(1))
        repo = UsuarioRepository(sess)
        assert await repo.delete(1) is True

    @pytest.mark.asyncio
    async def test_delete_not_found(self):
        sess = _sess()
        sess.execute = AsyncMock(return_value=_result_rowcount(0))
        repo = UsuarioRepository(sess)
        assert await repo.delete(99) is False

    @pytest.mark.asyncio
    async def test_get_user_plan_adm(self):
        sess = _sess()
        repo = UsuarioRepository(sess)
        assert await repo.get_user_plan(1, "ADM") == "PREMIUM"

    @pytest.mark.asyncio
    async def test_get_user_plan_ue_with_plan(self):
        sess = _sess()
        sess.execute = AsyncMock(return_value=_result_scalar_one_or_none("PREMIUM"))
        repo = UsuarioRepository(sess)
        assert await repo.get_user_plan(1, "UE") == "PREMIUM"

    @pytest.mark.asyncio
    async def test_get_user_plan_ue_no_plan(self):
        sess = _sess()
        sess.execute = AsyncMock(return_value=_result_scalar_one_or_none(None))
        repo = UsuarioRepository(sess)
        assert await repo.get_user_plan(1, "UE") == "FREE"

    @pytest.mark.asyncio
    async def test_get_user_plan_up(self):
        sess = _sess()
        repo = UsuarioRepository(sess)
        assert await repo.get_user_plan(1, "UP") == "FREE"

    @pytest.mark.asyncio
    async def test_count_by_tipo(self):
        sess = _sess()
        sess.execute = AsyncMock(return_value=_result_scalar_one(5))
        repo = UsuarioRepository(sess)
        assert await repo.count_by_tipo("UE") == 5

    @pytest.mark.asyncio
    async def test_count_all(self):
        sess = _sess()
        sess.execute = AsyncMock(return_value=_result_scalar_one(100))
        repo = UsuarioRepository(sess)
        assert await repo.count_all() == 100


# ── FazendaRepository ─────────────────────────────────────────────────────────
class TestFazendaRepository:
    @pytest.mark.asyncio
    async def test_get_all(self):
        sess = _sess()
        sess.execute = AsyncMock(return_value=_result_scalars([]))
        repo = FazendaRepository(sess)
        assert await repo.get_all() == []

    @pytest.mark.asyncio
    async def test_get_by_id(self):
        sess = _sess()
        f = MagicMock(id=1)
        sess.execute = AsyncMock(return_value=_result_scalar_one_or_none(f))
        repo = FazendaRepository(sess)
        assert await repo.get_by_id(1) is f

    @pytest.mark.asyncio
    async def test_get_by_cpf_cnpj(self):
        sess = _sess()
        sess.execute = AsyncMock(return_value=_result_scalar_one_or_none(None))
        repo = FazendaRepository(sess)
        assert await repo.get_by_cpf_cnpj("12345678000190") is None

    @pytest.mark.asyncio
    async def test_update_with_data(self):
        sess = _sess()
        sess.execute = AsyncMock(return_value=_result_rowcount(1))
        repo = FazendaRepository(sess)
        data = MagicMock()
        data.model_dump.return_value = {"nome": "Nova Fazenda"}
        assert await repo.update(1, data) is True

    @pytest.mark.asyncio
    async def test_update_no_data(self):
        sess = _sess()
        repo = FazendaRepository(sess)
        data = MagicMock()
        data.model_dump.return_value = {}
        assert await repo.update(1, data) is False

    @pytest.mark.asyncio
    async def test_delete(self):
        sess = _sess()
        sess.execute = AsyncMock(return_value=_result_rowcount(1))
        repo = FazendaRepository(sess)
        assert await repo.delete(1) is True

    @pytest.mark.asyncio
    async def test_get_usuarios(self):
        sess = _sess()
        mock_row = (MagicMock(), "PROPRIETARIO")
        result = MagicMock()
        result.all.return_value = [mock_row]
        sess.execute = AsyncMock(return_value=result)
        repo = FazendaRepository(sess)
        usuarios = await repo.get_usuarios(1)
        assert len(usuarios) == 1
        assert usuarios[0]["papel"] == "PROPRIETARIO"

    @pytest.mark.asyncio
    async def test_add_usuario(self):
        sess = _sess()
        repo = FazendaRepository(sess)
        result = await repo.add_usuario(1, 2, "PROPRIETARIO")
        assert result is True
        sess.add.assert_called_once()
        sess.commit.assert_called_once()
