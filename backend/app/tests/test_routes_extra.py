"""
Testes de integração – rotas restantes.
Todos os patches são feitos no módulo do router, onde o serviço é instanciado.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from fastapi.testclient import TestClient
from app.main import app


# ── Laboratorio ───────────────────────────────────────────────────────────────
class TestLaboratorioRoutes:
    def test_list_labs_adm(self, client):
        with patch("app.routers.laboratorio.LaboratorioService") as MockSvc:
            MockSvc.return_value.get_all = AsyncMock(return_value=[])
            r = client.get("/api/v1/laboratorios/")
            assert r.status_code == 200

    def test_get_lab_with_access(self, client):
        with patch("app.routers.laboratorio.LabAccessService") as MockAcc:
            MockAcc.return_value.assert_lab_access = AsyncMock()
            with patch("app.routers.laboratorio.LaboratorioService") as MockSvc:
                lab = MagicMock(
                    id=1, nome="Lab", cnpj="11222333000181",
                    email="lab@test.com", ativo="Y",
                    criado_em=datetime.now(), laboratorio_pai_id=None,
                    usuario_id=1, tipo_unidade="MATRIZ",
                    acreditacao_iso17025="N", endereco_id=None,
                    registro_renasem=None, credenciamento_mapa=None,
                )
                MockSvc.return_value.get_by_id = AsyncMock(return_value=lab)
                r = client.get("/api/v1/laboratorios/1")
                assert r.status_code == 200

    def test_list_my_labs(self, client):
        with patch("app.routers.laboratorio.LabAccessService") as MockAcc:
            MockAcc.return_value.visible_labs_for_user = AsyncMock(return_value=[])
            r = client.get("/api/v1/laboratorios/me")
            assert r.status_code == 200

    def test_get_lab_usuarios(self, client):
        with patch("app.routers.laboratorio.LabAccessService") as MockAcc:
            MockAcc.return_value.assert_lab_access = AsyncMock()
            with patch("app.routers.laboratorio.LaboratorioService") as MockSvc:
                MockSvc.return_value.get_usuarios = AsyncMock(return_value=[])
                r = client.get("/api/v1/laboratorios/1/usuarios")
                assert r.status_code == 200

    def test_get_lab_telefones(self, client):
        with patch("app.routers.laboratorio.LabAccessService") as MockAcc:
            MockAcc.return_value.assert_lab_access = AsyncMock()
            with patch("app.routers.laboratorio.LaboratorioService") as MockSvc:
                MockSvc.return_value.get_telefones = AsyncMock(return_value=[])
                r = client.get("/api/v1/laboratorios/1/telefones")
                assert r.status_code == 200

    def test_get_lab_clientes(self, client):
        with patch("app.routers.laboratorio.LabAccessService") as MockAcc:
            MockAcc.return_value.assert_lab_access = AsyncMock()
            with patch("app.routers.laboratorio.LaboratorioService") as MockSvc:
                MockSvc.return_value.get_clientes = AsyncMock(return_value=[])
                r = client.get("/api/v1/laboratorios/1/clientes")
                assert r.status_code == 200

    def test_delete_laboratorio(self, client):
        with patch("app.routers.laboratorio.LabAccessService") as MockAcc:
            MockAcc.return_value.assert_lab_access = AsyncMock()
            with patch("app.routers.laboratorio.LaboratorioService") as MockSvc:
                MockSvc.return_value.delete = AsyncMock(return_value=True)
                r = client.delete("/api/v1/laboratorios/1")
                assert r.status_code == 200

    def test_create_lab_missing_fields(self, client):
        r = client.post("/api/v1/laboratorios/", json={"nome": "Lab X"})
        assert r.status_code == 422


# ── Dashboard ─────────────────────────────────────────────────────────────────
class TestDashboardRoutes:
    def test_dashboard_endpoint(self, client):
        from app.schemas.dashboard import DashboardResponse, DashboardStats
        mock_resp = DashboardResponse(
            stats=DashboardStats(total_amostras=0, processadas_hoje=0,
                                  pendentes=0, laudos_emitidos=0),
            trends=[],
        )
        with patch("app.routers.dashboard.LabAccessService") as MockAcc:
            MockAcc.return_value.metric_lab_ids_for_user = AsyncMock(return_value={1})
            with patch("app.routers.dashboard.DashboardService") as MockDash:
                MockDash.return_value.get_dashboard = AsyncMock(return_value=mock_resp)
                r = client.get("/api/v1/dashboard/?lab_id=1")
                assert r.status_code == 200

    def test_stats_endpoint(self, client):
        from app.schemas.dashboard import DashboardStats
        mock_stats = DashboardStats(
            total_amostras=10, processadas_hoje=2, pendentes=3, laudos_emitidos=5
        )
        with patch("app.routers.dashboard.LabAccessService") as MockAcc:
            MockAcc.return_value.metric_lab_ids_for_user = AsyncMock(return_value={1})
            with patch("app.routers.dashboard.DashboardService") as MockDash:
                MockDash.return_value.get_stats = AsyncMock(return_value=mock_stats)
                r = client.get("/api/v1/dashboard/stats?lab_id=1")
                assert r.status_code == 200

    def test_trends_endpoint(self, client):
        with patch("app.routers.dashboard.LabAccessService") as MockAcc:
            MockAcc.return_value.metric_lab_ids_for_user = AsyncMock(return_value={1})
            with patch("app.routers.dashboard.DashboardService") as MockDash:
                MockDash.return_value.get_trends = AsyncMock(return_value=[])
                r = client.get("/api/v1/dashboard/trends?lab_id=1")
                assert r.status_code == 200


# ── Admin ─────────────────────────────────────────────────────────────────────
class TestAdminRoutes:
    def test_list_users(self, client):
        with patch("app.routers.admin.AdminService") as MockSvc:
            MockSvc.return_value.get_all_users = AsyncMock(return_value=[])
            r = client.get("/api/v1/admin/usuarios")
            assert r.status_code == 200

    def test_list_labs(self, client):
        with patch("app.routers.admin.AdminService") as MockSvc:
            MockSvc.return_value.get_all_labs = AsyncMock(return_value=[])
            r = client.get("/api/v1/admin/laboratorios")
            assert r.status_code == 200

    def test_list_producers(self, client):
        with patch("app.routers.admin.AdminService") as MockSvc:
            MockSvc.return_value.get_all_producers = AsyncMock(return_value=[])
            r = client.get("/api/v1/admin/produtores")
            assert r.status_code == 200

    def test_openapi_catalog(self, client):
        r = client.get("/api/v1/admin/openapi")
        assert r.status_code == 200

    def test_system_checks_post(self, client):
        r = client.post("/api/v1/admin/system-checks")
        assert r.status_code == 200

    def test_admin_dashboard(self, client):
        with patch("app.routers.admin.AdminService") as MockSvc:
            MockSvc.return_value.get_dashboard = AsyncMock(return_value={
                "total_usuarios": 0, "total_produtores": 0,
                "total_lab_premium": 0, "total_lab_free": 0,
                "total_amostras": 0, "total_laudos": 0,
                "total_laboratorios": 0, "total_fazendas": 0,
            })
            r = client.get("/api/v1/admin/dashboard")
            assert r.status_code == 200


# ── Amostra ───────────────────────────────────────────────────────────────────
class TestAmostraRoutes:
    def test_list_amostras_as_adm(self, client):
        """ADM user: vai pelo branch visible_lab_ids_for_user."""
        with patch("app.routers.amostra.LabAccessService") as MockAcc:
            MockAcc.return_value.visible_lab_ids_for_user = AsyncMock(return_value={1})
            with patch("app.routers.amostra.AmostraService") as MockSvc:
                MockSvc.return_value.get_all_by_labs = AsyncMock(return_value=[])
                r = client.get("/api/v1/amostras/")
                assert r.status_code == 200

    def test_get_amostra_not_found(self, client):
        from fastapi import HTTPException
        with patch("app.routers.amostra.AmostraService") as MockSvc:
            MockSvc.return_value.get_by_id = AsyncMock(
                side_effect=HTTPException(status_code=404, detail="não encontrada"))
            r = client.get("/api/v1/amostras/999")
            assert r.status_code == 404

    def test_get_amostras_by_cliente_as_adm(self, client):
        """ADM can view any cliente's samples."""
        with patch("app.routers.amostra.AmostraService") as MockSvc:
            MockSvc.return_value.get_by_cliente = AsyncMock(return_value=[])
            with patch("app.routers.amostra.LabAccessService") as MockAcc:
                MockAcc.return_value.visible_lab_ids_for_user = AsyncMock(return_value={1})
                r = client.get("/api/v1/amostras/cliente/1")
                assert r.status_code == 200

    def test_minhas_amostras(self, client):
        with patch("app.routers.amostra.AmostraService") as MockSvc:
            MockSvc.return_value.get_by_cliente = AsyncMock(return_value=[])
            r = client.get("/api/v1/amostras/minhas")
            assert r.status_code == 200


# ── Laudo ─────────────────────────────────────────────────────────────────────
class TestLaudoRoutes:
    def test_list_laudos(self, client):
        with patch("app.routers.laudo.LabAccessService") as MockAcc:
            MockAcc.return_value.metric_lab_ids_for_user = AsyncMock(return_value={1})
            with patch("app.routers.laudo.LaudoService") as MockSvc:
                MockSvc.return_value.get_all_by_labs = AsyncMock(return_value=[])
                r = client.get("/api/v1/laudos/?lab_id=1")
                assert r.status_code == 200

    def test_get_laudo_not_found(self, client):
        from fastapi import HTTPException
        with patch("app.routers.laudo.LaudoService") as MockSvc:
            MockSvc.return_value.get_by_id = AsyncMock(
                side_effect=HTTPException(status_code=404, detail="não encontrado"))
            r = client.get("/api/v1/laudos/999")
            assert r.status_code == 404

    def test_get_resultados(self, client):
        with patch("app.routers.laudo.LaudoService") as MockSvc:
            MockSvc.return_value.get_resultados = AsyncMock(return_value=[])
            r = client.get("/api/v1/laudos/1/resultados")
            assert r.status_code == 200

    def test_get_laudos_by_amostra(self, client):
        laudo = MagicMock(laboratorio_id=1)
        with patch("app.routers.laudo.LaudoService") as MockSvc:
            MockSvc.return_value.get_by_amostra = AsyncMock(return_value=laudo)
            with patch("app.routers.laudo.LabAccessService") as MockAcc:
                MockAcc.return_value.assert_lab_access = AsyncMock()
                r = client.get("/api/v1/laudos/amostra/1")
                assert r.status_code == 200

    def test_get_laudos_by_cliente(self, client):
        with patch("app.routers.laudo.LaudoService") as MockSvc:
            MockSvc.return_value.get_by_cliente = AsyncMock(return_value=[])
            r = client.get("/api/v1/laudos/cliente/1")
            assert r.status_code == 200

    def test_delete_laudo(self, client):
        laudo = MagicMock(laboratorio_id=1)
        with patch("app.routers.laudo.LaudoService") as MockSvc:
            MockSvc.return_value.get_by_id = AsyncMock(return_value=laudo)
            MockSvc.return_value.delete = AsyncMock(return_value={"detail": "removido"})
            with patch("app.routers.laudo.LabAccessService") as MockAcc:
                MockAcc.return_value.assert_lab_access = AsyncMock()
                r = client.delete("/api/v1/laudos/1")
                assert r.status_code == 200


# ── Talhao ────────────────────────────────────────────────────────────────────
class TestTalhaoRoutes:
    def test_list_talhoes(self, client):
        with patch("app.routers.talhao.FazendaService") as MockSvc:
            MockSvc.return_value.get_all_talhoes = AsyncMock(return_value=[])
            r = client.get("/api/v1/talhoes/")
            assert r.status_code == 200

    def test_get_talhao_not_found(self, client):
        from fastapi import HTTPException
        with patch("app.routers.talhao.FazendaService") as MockSvc:
            MockSvc.return_value.get_talhao_by_id = AsyncMock(
                side_effect=HTTPException(status_code=404, detail="não encontrado"))
            r = client.get("/api/v1/talhoes/999")
            assert r.status_code == 404

    def test_delete_talhao(self, client):
        with patch("app.routers.talhao.FazendaService") as MockSvc:
            MockSvc.return_value.delete_talhao = AsyncMock(return_value={"detail": "removido"})
            r = client.delete("/api/v1/talhoes/1")
            assert r.status_code == 200


# ── Usuario ───────────────────────────────────────────────────────────────────
class TestUsuarioRoutes:
    def test_list_usuarios(self, client):
        with patch("app.routers.usuario.UsuarioService") as MockSvc:
            MockSvc.return_value.get_all = AsyncMock(return_value=[])
            r = client.get("/api/v1/usuarios/")
            assert r.status_code == 200

    def test_get_usuario_not_found(self, client):
        from fastapi import HTTPException
        with patch("app.routers.usuario.UsuarioService") as MockSvc:
            MockSvc.return_value.get_by_id = AsyncMock(
                side_effect=HTTPException(status_code=404, detail="não encontrado"))
            r = client.get("/api/v1/usuarios/999")
            assert r.status_code == 404

    def test_delete_usuario(self, client):
        with patch("app.routers.usuario.UsuarioService") as MockSvc:
            MockSvc.return_value.delete = AsyncMock(return_value={"detail": "removido"})
            r = client.delete("/api/v1/usuarios/1")
            assert r.status_code == 200


# ── Endereco ──────────────────────────────────────────────────────────────────
class TestEnderecoRoutes:
    def test_list_enderecos(self, client):
        with patch("app.routers.endereco.EnderecoService") as MockSvc:
            MockSvc.return_value.get_all = AsyncMock(return_value=[])
            r = client.get("/api/v1/enderecos/")
            assert r.status_code == 200

    def test_get_endereco_not_found(self, client):
        from fastapi import HTTPException
        with patch("app.routers.endereco.EnderecoService") as MockSvc:
            MockSvc.return_value.get_by_id = AsyncMock(
                side_effect=HTTPException(status_code=404, detail="não encontrado"))
            r = client.get("/api/v1/enderecos/999")
            assert r.status_code == 404

    def test_delete_endereco(self, client):
        with patch("app.routers.endereco.EnderecoService") as MockSvc:
            MockSvc.return_value.delete = AsyncMock(return_value=True)
            r = client.delete("/api/v1/enderecos/1")
            assert r.status_code == 200


# ── Importacao ────────────────────────────────────────────────────────────────
class TestImportacaoRoutes:
    def test_list_importacoes(self, client):
        with patch("app.routers.importacao.LabAccessService") as MockAcc:
            MockAcc.return_value.metric_lab_ids_for_user = AsyncMock(return_value={1})
            with patch("app.routers.importacao.ImportacaoService") as MockSvc:
                MockSvc.return_value.get_all_by_labs = AsyncMock(return_value=[])
                r = client.get("/api/v1/importacoes?lab_id=1")
                assert r.status_code == 200

    def test_get_importacao_not_found(self, client):
        from fastapi import HTTPException
        with patch("app.routers.importacao.ImportacaoService") as MockSvc:
            MockSvc.return_value.get_by_id = AsyncMock(
                side_effect=HTTPException(status_code=404, detail="não encontrada"))
            r = client.get("/api/v1/importacoes/999")
            assert r.status_code == 404


# ── Fertilizer ────────────────────────────────────────────────────────────────
class TestFertilizerRoutes:
    def test_preview_unsupported_format(self, client):
        r = client.post(
            "/api/v1/fertilizers/preview",
            files={"file": ("test.txt", b"nope", "text/plain")},
        )
        assert r.status_code in (400, 422, 500)

    def test_preview_valid_csv(self, client):
        csv_content = (
            "SampleId,SampleLine,CA,MG\n"
            "SampleId,SampleLine,Calcium,Magnesium\n"
            "unit,unit,mg/L,mg/L\n"
            "S001,L001,50000,10000\n"
        ).encode("utf-8")
        r = client.post(
            "/api/v1/fertilizer/preview",
            files={"file": ("data.csv", csv_content, "text/csv")},
        )
        assert r.status_code == 200

    def test_build_report_payload(self, client):
        payload = {
            "sample": {
                "sample_id": "S001",
                "calcium_percent": 5.0,
                "magnesium_percent": 1.0,
                "sulfur_percent": 0.5,
                "elements_ppm": {},
            }
        }
        r = client.post("/api/v1/fertilizer/report-payload", json=payload)
        assert r.status_code == 200

    def test_render_pdf(self, client):
        payload = {
            "sample_number": "S001",
            "results": [{"parameter": "Cálcio", "unit": "%", "result": 5.0}],
        }
        r = client.post("/api/v1/fertilizer/render-pdf", json=payload)
        assert r.status_code == 200
        assert r.headers["content-type"] == "application/pdf"
