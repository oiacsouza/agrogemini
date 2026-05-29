"""
Testes – services de CRUD (FazendaService, AmostraService, LaudoService,
DashboardService, EnderecoService, ImportacaoService, UsuarioService,
AdminService) usando repositórios mockados.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException

from app.services.fazenda_service import FazendaService
from app.services.amostra_service import AmostraService
from app.services.laudo_service import LaudoService
from app.services.dashboard_service import DashboardService
from app.services.admin_service import AdminService
from app.schemas.dashboard import DashboardStats, TrendDataPoint, DashboardResponse


def _mock_session():
    s = AsyncMock()
    s.execute = AsyncMock()
    s.commit = AsyncMock()
    s.rollback = AsyncMock()
    s.flush = AsyncMock()
    s.add = MagicMock()
    return s


# ── FazendaService ───────────────────────────────────────────────────────────

class TestFazendaService:
    @pytest.mark.asyncio
    async def test_get_all(self):
        svc = FazendaService(_mock_session())
        svc.repo.get_all = AsyncMock(return_value=[])
        assert await svc.get_all() == []

    @pytest.mark.asyncio
    async def test_get_by_id_found(self):
        svc = FazendaService(_mock_session())
        f = MagicMock(id=1)
        svc.repo.get_by_id = AsyncMock(return_value=f)
        assert await svc.get_by_id(1) is f

    @pytest.mark.asyncio
    async def test_get_by_id_not_found_raises_404(self):
        svc = FazendaService(_mock_session())
        svc.repo.get_by_id = AsyncMock(return_value=None)
        with pytest.raises(HTTPException) as exc:
            await svc.get_by_id(99)
        assert exc.value.status_code == 404

    @pytest.mark.asyncio
    async def test_create(self):
        svc = FazendaService(_mock_session())
        mock_f = MagicMock(id=1)
        svc.repo.create = AsyncMock(return_value=1)
        svc.repo.get_by_id = AsyncMock(return_value=mock_f)
        result = await svc.create(MagicMock())
        assert result is mock_f

    @pytest.mark.asyncio
    async def test_update(self):
        svc = FazendaService(_mock_session())
        mock_f = MagicMock(id=5)
        svc.repo.get_by_id = AsyncMock(return_value=mock_f)
        svc.repo.update = AsyncMock(return_value=True)
        result = await svc.update(5, MagicMock())
        assert result is mock_f

    @pytest.mark.asyncio
    async def test_delete(self):
        svc = FazendaService(_mock_session())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        svc.repo.delete = AsyncMock(return_value=True)
        assert await svc.delete(1) is True

    @pytest.mark.asyncio
    async def test_get_talhoes(self):
        svc = FazendaService(_mock_session())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        svc.talhao_repo.get_by_fazenda = AsyncMock(return_value=[])
        assert await svc.get_talhoes(1) == []

    @pytest.mark.asyncio
    async def test_get_usuarios(self):
        svc = FazendaService(_mock_session())
        svc.repo.get_usuarios = AsyncMock(return_value=[])
        assert await svc.get_usuarios(1) == []

    @pytest.mark.asyncio
    async def test_add_usuario(self):
        svc = FazendaService(_mock_session())
        svc.repo.add_usuario = AsyncMock(return_value=True)
        assert await svc.add_usuario(MagicMock()) is True

    @pytest.mark.asyncio
    async def test_get_all_talhoes(self):
        svc = FazendaService(_mock_session())
        svc.talhao_repo.get_all = AsyncMock(return_value=[])
        assert await svc.get_all_talhoes() == []

    @pytest.mark.asyncio
    async def test_get_talhao_by_id_found(self):
        svc = FazendaService(_mock_session())
        t = MagicMock(id=1)
        svc.talhao_repo.get_by_id = AsyncMock(return_value=t)
        assert await svc.get_talhao_by_id(1) is t

    @pytest.mark.asyncio
    async def test_get_talhao_by_id_not_found(self):
        svc = FazendaService(_mock_session())
        svc.talhao_repo.get_by_id = AsyncMock(return_value=None)
        with pytest.raises(HTTPException) as exc:
            await svc.get_talhao_by_id(99)
        assert exc.value.status_code == 404

    @pytest.mark.asyncio
    async def test_create_talhao(self):
        svc = FazendaService(_mock_session())
        data = MagicMock(fazenda_id=1)
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        svc.talhao_repo.create = AsyncMock(return_value=10)
        t = MagicMock(id=10)
        svc.talhao_repo.get_by_id = AsyncMock(return_value=t)
        assert await svc.create_talhao(data) is t

    @pytest.mark.asyncio
    async def test_update_talhao(self):
        svc = FazendaService(_mock_session())
        t = MagicMock(id=5)
        svc.talhao_repo.get_by_id = AsyncMock(return_value=t)
        svc.talhao_repo.update = AsyncMock(return_value=True)
        assert await svc.update_talhao(5, MagicMock()) is t

    @pytest.mark.asyncio
    async def test_delete_talhao_success(self):
        svc = FazendaService(_mock_session())
        svc.talhao_repo.get_by_id = AsyncMock(return_value=MagicMock(id=5))
        svc.talhao_repo.delete = AsyncMock(return_value=True)
        result = await svc.delete_talhao(5)
        assert "removido" in result["detail"]

    @pytest.mark.asyncio
    async def test_delete_talhao_failure_raises_500(self):
        svc = FazendaService(_mock_session())
        svc.talhao_repo.get_by_id = AsyncMock(return_value=MagicMock(id=5))
        svc.talhao_repo.delete = AsyncMock(return_value=False)
        with pytest.raises(HTTPException) as exc:
            await svc.delete_talhao(5)
        assert exc.value.status_code == 500


# ── AmostraService ───────────────────────────────────────────────────────────

class TestAmostraService:
    @pytest.mark.asyncio
    async def test_get_all(self):
        svc = AmostraService(_mock_session())
        svc.repo.get_all = AsyncMock(return_value=[])
        assert await svc.get_all() == []

    @pytest.mark.asyncio
    async def test_get_all_with_lab_id(self):
        svc = AmostraService(_mock_session())
        svc.repo.get_all = AsyncMock(return_value=[])
        assert await svc.get_all(lab_id=1, limit=50) == []

    @pytest.mark.asyncio
    async def test_get_all_by_labs(self):
        svc = AmostraService(_mock_session())
        svc.repo.get_all_by_labs = AsyncMock(return_value=[])
        assert await svc.get_all_by_labs({1, 2}) == []

    @pytest.mark.asyncio
    async def test_get_by_id_found(self):
        svc = AmostraService(_mock_session())
        a = MagicMock(id=1)
        svc.repo.get_by_id = AsyncMock(return_value=a)
        assert await svc.get_by_id(1) is a

    @pytest.mark.asyncio
    async def test_get_by_id_not_found(self):
        svc = AmostraService(_mock_session())
        svc.repo.get_by_id = AsyncMock(return_value=None)
        with pytest.raises(HTTPException) as exc:
            await svc.get_by_id(99)
        assert exc.value.status_code == 404

    @pytest.mark.asyncio
    async def test_get_by_cliente(self):
        svc = AmostraService(_mock_session())
        svc.repo.get_by_cliente = AsyncMock(return_value=[])
        assert await svc.get_by_cliente(1) == []

    @pytest.mark.asyncio
    async def test_create(self):
        svc = AmostraService(_mock_session())
        a = MagicMock(id=1)
        svc.repo.create = AsyncMock(return_value=1)
        svc.repo.get_by_id = AsyncMock(return_value=a)
        assert await svc.create(MagicMock()) is a

    @pytest.mark.asyncio
    async def test_update(self):
        svc = AmostraService(_mock_session())
        a = MagicMock(id=1)
        svc.repo.get_by_id = AsyncMock(return_value=a)
        svc.repo.update = AsyncMock(return_value=True)
        assert await svc.update(1, MagicMock()) is a

    @pytest.mark.asyncio
    async def test_delete(self):
        svc = AmostraService(_mock_session())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        svc.repo.delete = AsyncMock(return_value=True)
        assert await svc.delete(1) is True


# ── LaudoService ─────────────────────────────────────────────────────────────

class TestLaudoService:
    @pytest.mark.asyncio
    async def test_get_all(self):
        svc = LaudoService(_mock_session())
        svc.repo.get_all = AsyncMock(return_value=[])
        assert await svc.get_all() == []

    @pytest.mark.asyncio
    async def test_get_all_by_labs(self):
        svc = LaudoService(_mock_session())
        svc.repo.get_all_by_labs = AsyncMock(return_value=[])
        assert await svc.get_all_by_labs({1}) == []

    @pytest.mark.asyncio
    async def test_get_by_id_found(self):
        svc = LaudoService(_mock_session())
        l = MagicMock(id=1)
        svc.repo.get_by_id = AsyncMock(return_value=l)
        assert await svc.get_by_id(1) is l

    @pytest.mark.asyncio
    async def test_get_by_id_not_found(self):
        svc = LaudoService(_mock_session())
        svc.repo.get_by_id = AsyncMock(return_value=None)
        with pytest.raises(HTTPException) as exc:
            await svc.get_by_id(99)
        assert exc.value.status_code == 404

    @pytest.mark.asyncio
    async def test_get_by_amostra(self):
        svc = LaudoService(_mock_session())
        svc.repo.get_by_amostra = AsyncMock(return_value=[])
        assert await svc.get_by_amostra(1) == []

    @pytest.mark.asyncio
    async def test_get_by_cliente(self):
        svc = LaudoService(_mock_session())
        svc.repo.get_by_cliente = AsyncMock(return_value=[])
        assert await svc.get_by_cliente(1) == []

    @pytest.mark.asyncio
    async def test_create(self):
        svc = LaudoService(_mock_session())
        l = MagicMock(id=1)
        svc.repo.create = AsyncMock(return_value=1)
        svc.repo.get_by_id = AsyncMock(return_value=l)
        assert await svc.create(MagicMock()) is l

    @pytest.mark.asyncio
    async def test_update(self):
        svc = LaudoService(_mock_session())
        l = MagicMock(id=1)
        svc.repo.get_by_id = AsyncMock(return_value=l)
        svc.repo.update = AsyncMock(return_value=True)
        assert await svc.update(1, MagicMock()) is l

    @pytest.mark.asyncio
    async def test_delete_success(self):
        svc = LaudoService(_mock_session())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        svc.repo.delete = AsyncMock(return_value=True)
        result = await svc.delete(1)
        assert "removido" in result["detail"]

    @pytest.mark.asyncio
    async def test_delete_failure_raises_500(self):
        svc = LaudoService(_mock_session())
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        svc.repo.delete = AsyncMock(return_value=False)
        with pytest.raises(HTTPException) as exc:
            await svc.delete(1)
        assert exc.value.status_code == 500

    @pytest.mark.asyncio
    async def test_get_resultados(self):
        svc = LaudoService(_mock_session())
        svc.repo.get_resultados = AsyncMock(return_value=[])
        assert await svc.get_resultados(1) == []

    @pytest.mark.asyncio
    async def test_add_resultado(self):
        svc = LaudoService(_mock_session())
        r = MagicMock(id=10)
        svc.repo.get_by_id = AsyncMock(return_value=MagicMock(id=1))
        svc.repo.add_resultado = AsyncMock(return_value=10)
        svc.repo.get_resultado_by_id = AsyncMock(return_value=r)
        assert await svc.add_resultado(1, MagicMock()) is r


# ── DashboardService ──────────────────────────────────────────────────────────

class TestDashboardService:
    @pytest.mark.asyncio
    async def test_get_stats(self):
        svc = DashboardService(_mock_session())
        svc.amostra_repo.count_by_labs = AsyncMock(return_value=10)
        svc.amostra_repo.count_today_by_labs = AsyncMock(return_value=2)
        svc.amostra_repo.count_by_status_for_labs = AsyncMock(return_value=3)
        svc.laudo_repo.count_by_labs = AsyncMock(return_value=5)
        stats = await svc.get_stats({1, 2})
        assert stats.total_amostras == 10
        assert stats.processadas_hoje == 2
        assert stats.pendentes == 3
        assert stats.laudos_emitidos == 5

    @pytest.mark.asyncio
    async def test_get_trends(self):
        svc = DashboardService(_mock_session())
        svc.amostra_repo.monthly_trend_for_labs = AsyncMock(
            return_value=[{"month": "2026-01", "samples": 5}]
        )
        trends = await svc.get_trends({1})
        assert len(trends) == 1
        assert trends[0].month == "2026-01"
        assert trends[0].samples == 5

    @pytest.mark.asyncio
    async def test_get_dashboard(self):
        svc = DashboardService(_mock_session())
        svc.amostra_repo.count_by_labs = AsyncMock(return_value=0)
        svc.amostra_repo.count_today_by_labs = AsyncMock(return_value=0)
        svc.amostra_repo.count_by_status_for_labs = AsyncMock(return_value=0)
        svc.laudo_repo.count_by_labs = AsyncMock(return_value=0)
        svc.amostra_repo.monthly_trend_for_labs = AsyncMock(return_value=[])
        result = await svc.get_dashboard({1})
        assert isinstance(result, DashboardResponse)


# ── AdminService ──────────────────────────────────────────────────────────────

class TestAdminService:
    def _build(self):
        svc = AdminService(_mock_session())
        svc.user_repo.count_all = AsyncMock(return_value=100)
        svc.user_repo.count_by_tipo = AsyncMock(return_value=10)
        return svc

    @pytest.mark.asyncio
    async def test_get_dashboard(self):
        svc = self._build()
        # mock scalar returns for text() queries
        mock_result = MagicMock()
        mock_result.scalar = MagicMock(return_value=5)
        svc.session.execute = AsyncMock(return_value=mock_result)
        result = await svc.get_dashboard()
        assert result["total_usuarios"] == 100
        assert result["total_amostras"] == 5

    @pytest.mark.asyncio
    async def test_get_all_users_no_filter(self):
        svc = self._build()
        svc.user_repo.get_all = AsyncMock(return_value=[])
        assert await svc.get_all_users() == []

    @pytest.mark.asyncio
    async def test_get_all_users_with_filter(self):
        svc = self._build()
        svc.user_repo.get_by_tipo = AsyncMock(return_value=[])
        assert await svc.get_all_users(tipo="UE") == []

    @pytest.mark.asyncio
    async def test_get_all_labs(self):
        svc = self._build()
        mock_result = MagicMock()
        mock_result.__iter__ = MagicMock(return_value=iter([]))
        svc.session.execute = AsyncMock(return_value=mock_result)
        result = await svc.get_all_labs()
        assert isinstance(result, list)

    @pytest.mark.asyncio
    async def test_get_all_producers(self):
        svc = self._build()
        mock_result = MagicMock()
        mock_result.__iter__ = MagicMock(return_value=iter([]))
        svc.session.execute = AsyncMock(return_value=mock_result)
        result = await svc.get_all_producers()
        assert isinstance(result, list)
