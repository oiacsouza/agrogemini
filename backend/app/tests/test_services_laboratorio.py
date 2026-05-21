"""Testes – LaboratorioService e LabAccessService (access_control)."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.services.laboratorio_service import LaboratorioService
from app.services.access_control import LabAccessService


def _sess():
    s = AsyncMock()
    s.add = MagicMock()
    s.flush = AsyncMock()
    s.commit = AsyncMock()
    s.rollback = AsyncMock()
    return s


# ── LaboratorioService ────────────────────────────────────────────────────────
class TestLaboratorioService:
    @pytest.mark.asyncio
    async def test_get_all(self):
        svc = LaboratorioService(_sess())
        svc.repo.get_all = AsyncMock(return_value=[])
        assert await svc.get_all() == []

    @pytest.mark.asyncio
    async def test_get_with_stats(self):
        svc = LaboratorioService(_sess())
        svc.repo.get_with_stats = AsyncMock(return_value=[])
        assert await svc.get_with_stats() == []

    @pytest.mark.asyncio
    async def test_get_by_id_found(self):
        svc = LaboratorioService(_sess())
        lab = MagicMock(id=1)
        svc.repo.get_by_id = AsyncMock(return_value=lab)
        assert await svc.get_by_id(1) is lab

    @pytest.mark.asyncio
    async def test_get_by_id_not_found(self):
        svc = LaboratorioService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=None)
        with pytest.raises(HTTPException) as exc:
            await svc.get_by_id(99)
        assert exc.value.status_code == 404

    @pytest.mark.asyncio
    async def test_get_by_user(self):
        svc = LaboratorioService(_sess())
        svc.repo.get_by_user = AsyncMock(return_value=[])
        assert await svc.get_by_user(1) == []

    @pytest.mark.asyncio
    async def test_create(self):
        svc = LaboratorioService(_sess())
        lab = MagicMock(id=1)
        svc.repo.create = AsyncMock(return_value=1)
        svc.repo.get_by_id = AsyncMock(return_value=lab)
        assert await svc.create(MagicMock()) is lab

    @pytest.mark.asyncio
    async def test_create_for_user_with_usuario_id_none(self):
        svc = LaboratorioService(_sess())
        lab = MagicMock(id=1, usuario_id=None)
        svc.repo.create = AsyncMock(return_value=1)
        svc.repo.get_by_id = AsyncMock(return_value=lab)
        svc.repo.add_usuario = AsyncMock(return_value=True)
        result = await svc.create_for_user(MagicMock(), user_id=99)
        assert result is lab

    @pytest.mark.asyncio
    async def test_create_for_user_with_usuario_id_set(self):
        svc = LaboratorioService(_sess())
        lab = MagicMock(id=1, usuario_id=99)
        svc.repo.create = AsyncMock(return_value=1)
        svc.repo.get_by_id = AsyncMock(return_value=lab)
        svc.repo.add_usuario = AsyncMock(return_value=True)
        result = await svc.create_for_user(MagicMock(), user_id=99)
        assert result is lab

    @pytest.mark.asyncio
    async def test_update(self):
        svc = LaboratorioService(_sess())
        lab = MagicMock(id=1)
        svc.repo.get_by_id = AsyncMock(return_value=lab)
        svc.repo.update = AsyncMock(return_value=True)
        assert await svc.update(1, MagicMock()) is lab

    @pytest.mark.asyncio
    async def test_delete(self):
        svc = LaboratorioService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        svc.repo.delete = AsyncMock(return_value=True)
        assert await svc.delete(1) is True

    @pytest.mark.asyncio
    async def test_get_usuarios(self):
        svc = LaboratorioService(_sess())
        svc.repo.get_usuarios = AsyncMock(return_value=[])
        assert await svc.get_usuarios(1) == []

    @pytest.mark.asyncio
    async def test_add_usuario(self):
        svc = LaboratorioService(_sess())
        svc.repo.add_usuario = AsyncMock(return_value=True)
        assert await svc.add_usuario(1, 2, "TECNICO") is True

    @pytest.mark.asyncio
    async def test_remove_usuario(self):
        svc = LaboratorioService(_sess())
        svc.repo.remove_usuario = AsyncMock(return_value=True)
        assert await svc.remove_usuario(1, 2) is True

    @pytest.mark.asyncio
    async def test_get_telefones(self):
        svc = LaboratorioService(_sess())
        svc.repo.get_telefones = AsyncMock(return_value=[])
        assert await svc.get_telefones(1) == []

    @pytest.mark.asyncio
    async def test_add_telefone(self):
        svc = LaboratorioService(_sess())
        svc.repo.add_telefone = AsyncMock(return_value=True)
        assert await svc.add_telefone(1, "65999999999", "MOVEL") is True

    @pytest.mark.asyncio
    async def test_get_clientes(self):
        svc = LaboratorioService(_sess())
        svc.repo.get_clientes = AsyncMock(return_value=[])
        assert await svc.get_clientes(1) == []

    @pytest.mark.asyncio
    async def test_add_cliente(self):
        svc = LaboratorioService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        svc.repo.add_cliente = AsyncMock(return_value=True)
        assert await svc.add_cliente(1, 2) is True

    @pytest.mark.asyncio
    async def test_create_or_link_cliente_lab_not_found(self):
        svc = LaboratorioService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=None)
        with pytest.raises(HTTPException) as exc:
            await svc.create_or_link_cliente(1, "J", "S", "j@s.com")
        assert exc.value.status_code == 404

    @pytest.mark.asyncio
    async def test_create_or_link_cliente_missing_fields(self):
        svc = LaboratorioService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        with pytest.raises(HTTPException) as exc:
            await svc.create_or_link_cliente(1, "", "S", "j@s.com")
        assert exc.value.status_code == 422

    @pytest.mark.asyncio
    async def test_create_or_link_cliente_existing_non_ue(self):
        svc = LaboratorioService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        existing_user = MagicMock(tipo_usuario="ADM", ativo="Y")
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=existing_user)
        svc.session.execute = AsyncMock(return_value=mock_result)
        with pytest.raises(HTTPException) as exc:
            await svc.create_or_link_cliente(1, "João", "S", "j@s.com")
        assert exc.value.status_code == 400

    @pytest.mark.asyncio
    async def test_create_or_link_cliente_existing_inactive_ue(self):
        svc = LaboratorioService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        existing_user = MagicMock(tipo_usuario="UE", ativo="N", id=5, email="j@s.com")
        # The service reactivates the user then returns info dict with original args
        link_result = MagicMock()
        link_result.first = MagicMock(return_value=None)
        svc.session.execute = AsyncMock(
            side_effect=[
                MagicMock(scalar_one_or_none=MagicMock(return_value=existing_user)),
                link_result,
            ]
        )
        result = await svc.create_or_link_cliente(1, "João", "S", "j@s.com")
        # Service returns dict built from user.email (which is the mock attribute)
        assert result["email"] == "j@s.com"
        # user was reactivated
        assert existing_user.ativo == "Y"

    @pytest.mark.asyncio
    async def test_create_or_link_cliente_new_user(self):
        svc = LaboratorioService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        link_result = MagicMock()
        link_result.first = MagicMock(return_value=None)
        svc.session.execute = AsyncMock(
            side_effect=[
                MagicMock(scalar_one_or_none=MagicMock(return_value=None)),
                link_result,
            ]
        )
        result = await svc.create_or_link_cliente(1, "Maria", "S", "maria@s.com")
        assert result["nome"] == "Maria"

    @pytest.mark.asyncio
    async def test_create_or_link_cliente_existing_link(self):
        svc = LaboratorioService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        existing_user = MagicMock(tipo_usuario="UE", ativo="Y", id=5)
        existing_link = MagicMock()
        link_result = MagicMock()
        link_result.first = MagicMock(return_value=existing_link)
        svc.session.execute = AsyncMock(
            side_effect=[
                MagicMock(scalar_one_or_none=MagicMock(return_value=existing_user)),
                link_result,
            ]
        )
        result = await svc.create_or_link_cliente(1, "João", "S", "j@s.com")
        assert result["id"] == existing_user.id

    @pytest.mark.asyncio
    async def test_create_or_link_cliente_integrity_error_cliente(self):
        svc = LaboratorioService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        svc.session.execute = AsyncMock(
            side_effect=IntegrityError("CK_LAB_USUARIOS_PAPEL", {}, None)
        )
        with pytest.raises(HTTPException) as exc:
            await svc.create_or_link_cliente(1, "João", "S", "j@s.com")
        assert exc.value.status_code == 500

    @pytest.mark.asyncio
    async def test_create_or_link_cliente_integrity_error_other(self):
        svc = LaboratorioService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        svc.session.execute = AsyncMock(
            side_effect=IntegrityError("other_constraint", {}, None)
        )
        with pytest.raises(HTTPException) as exc:
            await svc.create_or_link_cliente(1, "João", "S", "j@s.com")
        assert exc.value.status_code == 400

    @pytest.mark.asyncio
    async def test_create_or_link_cliente_sqlalchemy_error(self):
        svc = LaboratorioService(_sess())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        svc.session.execute = AsyncMock(side_effect=SQLAlchemyError("db error"))
        with pytest.raises(HTTPException) as exc:
            await svc.create_or_link_cliente(1, "João", "S", "j@s.com")
        assert exc.value.status_code == 400


# ── LabAccessService ──────────────────────────────────────────────────────────
class TestLabAccessService:
    def _make_lab(self, id, pai_id=None, usuario_id=None):
        lab = MagicMock()
        lab.id = id
        lab.laboratorio_pai_id = pai_id
        lab.usuario_id = usuario_id
        lab.nome = f"Lab {id}"
        return lab

    def _mock_exec_sequence(self, session, *return_values):
        """Helper to set up session.execute side_effect returning scalars."""
        def make_scalars_result(items):
            r = MagicMock()
            r.scalars.return_value.all.return_value = items
            return r

        def make_rows_result(rows):
            r = MagicMock()
            r.all.return_value = [(x,) for x in rows]
            return r

        results = list(return_values)
        session.execute = AsyncMock(side_effect=results)

    @pytest.mark.asyncio
    async def test_adm_sees_all_labs(self):
        sess = _sess()
        labs = [self._make_lab(1), self._make_lab(2)]
        all_labs_result = MagicMock()
        all_labs_result.scalars.return_value.all.return_value = labs
        sess.execute = AsyncMock(return_value=all_labs_result)
        svc = LabAccessService(sess)
        ids = await svc.visible_lab_ids_for_user({"id": 1, "tipo_usuario": "ADM"})
        assert ids == {1, 2}

    @pytest.mark.asyncio
    async def test_lab_user_sees_own_and_children(self):
        sess = _sess()
        labs = [
            self._make_lab(1, pai_id=None),
            self._make_lab(2, pai_id=1),
        ]
        all_labs_result = MagicMock()
        all_labs_result.scalars.return_value.all.return_value = labs

        direct_result = MagicMock()
        direct_result.all.return_value = [(1,)]

        owner_result = MagicMock()
        owner_result.all.return_value = []

        sess.execute = AsyncMock(side_effect=[all_labs_result, direct_result, owner_result])
        svc = LabAccessService(sess)
        ids = await svc.visible_lab_ids_for_user({"id": 5, "tipo_usuario": "UP"})
        assert 1 in ids
        assert 2 in ids

    @pytest.mark.asyncio
    async def test_assert_lab_access_allowed(self):
        sess = _sess()
        labs = [self._make_lab(1)]
        all_labs = MagicMock()
        all_labs.scalars.return_value.all.return_value = labs
        direct = MagicMock()
        direct.all.return_value = [(1,)]
        owner = MagicMock()
        owner.all.return_value = []
        sess.execute = AsyncMock(side_effect=[all_labs, direct, owner])
        svc = LabAccessService(sess)
        await svc.assert_lab_access({"id": 5, "tipo_usuario": "UP"}, lab_id=1)

    @pytest.mark.asyncio
    async def test_assert_lab_access_denied(self):
        sess = _sess()
        all_labs = MagicMock()
        all_labs.scalars.return_value.all.return_value = []
        direct = MagicMock()
        direct.all.return_value = []
        owner = MagicMock()
        owner.all.return_value = []
        sess.execute = AsyncMock(side_effect=[all_labs, direct, owner])
        svc = LabAccessService(sess)
        with pytest.raises(HTTPException) as exc:
            await svc.assert_lab_access({"id": 5, "tipo_usuario": "UP"}, lab_id=99)
        assert exc.value.status_code == 403

    @pytest.mark.asyncio
    async def test_visible_labs_for_user_empty(self):
        sess = _sess()
        all_labs = MagicMock()
        all_labs.scalars.return_value.all.return_value = []
        direct = MagicMock()
        direct.all.return_value = []
        owner = MagicMock()
        owner.all.return_value = []
        sess.execute = AsyncMock(side_effect=[all_labs, direct, owner])
        svc = LabAccessService(sess)
        result = await svc.visible_labs_for_user({"id": 5, "tipo_usuario": "UP"})
        assert result == []

    @pytest.mark.asyncio
    async def test_visible_labs_for_user_with_results(self):
        sess = _sess()
        lab = self._make_lab(1)
        all_labs_r1 = MagicMock()
        all_labs_r1.scalars.return_value.all.return_value = [lab]
        direct = MagicMock()
        direct.all.return_value = [(1,)]
        owner = MagicMock()
        owner.all.return_value = []
        visible_result = MagicMock()
        visible_result.scalars.return_value.all.return_value = [lab]
        sess.execute = AsyncMock(side_effect=[all_labs_r1, direct, owner, visible_result])
        svc = LabAccessService(sess)
        result = await svc.visible_labs_for_user({"id": 5, "tipo_usuario": "UP"})
        assert len(result) == 1

    @pytest.mark.asyncio
    async def test_metric_lab_ids_for_user(self):
        sess = _sess()
        lab = self._make_lab(1, pai_id=None)
        all_labs_r = MagicMock()
        all_labs_r.scalars.return_value.all.return_value = [lab]
        direct = MagicMock()
        direct.all.return_value = [(1,)]
        owner = MagicMock()
        owner.all.return_value = []
        # Second call for metric_lab_ids
        all_labs_r2 = MagicMock()
        all_labs_r2.scalars.return_value.all.return_value = [lab]
        direct2 = MagicMock()
        direct2.all.return_value = [(1,)]
        owner2 = MagicMock()
        owner2.all.return_value = []
        all_labs_r3 = MagicMock()
        all_labs_r3.scalars.return_value.all.return_value = [lab]
        sess.execute = AsyncMock(
            side_effect=[all_labs_r, direct, owner, all_labs_r2, direct2, owner2, all_labs_r3]
        )
        svc = LabAccessService(sess)
        ids = await svc.metric_lab_ids_for_user({"id": 5, "tipo_usuario": "UP"}, lab_id=1)
        assert 1 in ids

    @pytest.mark.asyncio
    async def test_lab_user_with_parent_lab(self):
        """Lab com pai – o pai também deve ficar visível."""
        sess = _sess()
        labs = [self._make_lab(1, pai_id=None), self._make_lab(2, pai_id=1)]
        all_labs_r = MagicMock()
        all_labs_r.scalars.return_value.all.return_value = labs
        direct = MagicMock()
        direct.all.return_value = [(2,)]
        owner = MagicMock()
        owner.all.return_value = []
        sess.execute = AsyncMock(side_effect=[all_labs_r, direct, owner])
        svc = LabAccessService(sess)
        ids = await svc.visible_lab_ids_for_user({"id": 5, "tipo_usuario": "UP"})
        assert 1 in ids  # pai incluso
        assert 2 in ids
