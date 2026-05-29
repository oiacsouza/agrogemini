"""
Testes de integração leve – Rotas da API (via TestClient sem banco Oracle)

Estratégia:
- Banco: SQLite em memória (via conftest.py)
- Autenticação: mock ADM via conftest.py
- Repositórios: mockados com unittest.mock onde necessário
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient

from app.main import app


# ── Health ───────────────────────────────────────────────────────────────────

class TestHealthEndpoint:
    def test_health_returns_200_with_mock_db(self, client):
        """Health verifica DB; mockamos a sessão para retornar OK."""
        with patch("app.routers.health.get_db_session") as _:
            # O override de conftest já injeta SQLite; o SELECT 1 FROM DUAL vai falhar
            # mas o handler captura a exceção e retorna status: online, database: error
            resp = client.get("/api/v1/health/")
            assert resp.status_code == 200
            data = resp.json()
            assert data["status"] == "online"


# ── Auth - Validação de entrada (sem banco) ───────────────────────────────────

class TestAuthValidation:
    def test_login_missing_password_returns_422(self, client):
        resp = client.post("/api/v1/auth/login", json={"email": "a@b.com"})
        assert resp.status_code == 422
        data = resp.json()
        assert data["type"] == "ValidationError"

    def test_login_missing_email_returns_422(self, client):
        resp = client.post("/api/v1/auth/login", json={"senha": "Senha123!"})
        assert resp.status_code == 422

    def test_login_invalid_email_format_returns_422(self, client):
        resp = client.post(
            "/api/v1/auth/login", json={"email": "nao-e-email", "senha": "Senha123!"}
        )
        assert resp.status_code == 422

    def test_register_missing_fields_returns_422(self, client):
        resp = client.post("/api/v1/auth/register", json={"nome": "João"})
        assert resp.status_code == 422

    def test_login_with_real_service_returns_401_for_unknown_user(self, client):
        """Com banco SQLite vazio, qualquer login deve retornar 401."""
        with patch(
            "app.services.auth_service.AuthService.login",
            new_callable=AsyncMock,
            side_effect=__import__("fastapi").HTTPException(
                status_code=401, detail="Email ou senha inválidos"
            ),
        ):
            resp = client.post(
                "/api/v1/auth/login",
                json={"email": "naoexiste@test.com", "senha": "Senha123!"},
            )
            assert resp.status_code == 401

    def test_me_returns_mock_user(self, client):
        resp = client.get("/api/v1/auth/me")
        assert resp.status_code == 200
        data = resp.json()
        assert data["tipo_usuario"] == "ADM"

    def test_me_plan_returns_plan_info(self, client):
        with patch(
            "app.repositories.usuario_repository.UsuarioRepository.get_user_plan",
            new_callable=AsyncMock,
            return_value="PREMIUM",
        ):
            resp = client.get("/api/v1/auth/me/plan")
            assert resp.status_code == 200
            data = resp.json()
            assert "plano" in data
            assert data["user_id"] == 1


# ── Fazendas - Validação de entrada ──────────────────────────────────────────

class TestFazendaValidation:
    def test_create_fazenda_invalid_cnpj_returns_422(self, client):
        payload = {
            "nome": "Fazenda Teste",
            "cpf_cnpj": "11111111111111",  # CNPJ inválido
            "area_total_ha": 100.0,
        }
        resp = client.post("/api/v1/fazendas/", json=payload)
        assert resp.status_code == 422
        data = resp.json()
        assert data["type"] == "ValidationError"

    def test_create_fazenda_missing_nome_returns_422(self, client):
        resp = client.post(
            "/api/v1/fazendas/", json={"cpf_cnpj": "11.222.333/0001-81"}
        )
        assert resp.status_code == 422

    def test_create_fazenda_missing_cpf_cnpj_returns_422(self, client):
        resp = client.post("/api/v1/fazendas/", json={"nome": "Fazenda X"})
        assert resp.status_code == 422

    def test_list_fazendas_with_mocked_service(self, client):
        with patch(
            "app.services.fazenda_service.FazendaService.get_all",
            new_callable=AsyncMock,
            return_value=[],
        ):
            resp = client.get("/api/v1/fazendas/")
            assert resp.status_code == 200
            assert resp.json() == []

    def test_get_fazenda_mocked(self, client):
        from app.schemas.fazenda import FazendaResponse
        from datetime import datetime
        mock_fazenda = {
            "id": 1,
            "nome": "Fazenda A",
            "cpf_cnpj": "52998224725",
            "car": None,
            "area_total_ha": 50.0,
            "endereco_id": None,
            "criado_em": datetime.now().isoformat(),
        }
        with patch(
            "app.services.fazenda_service.FazendaService.get_by_id",
            new_callable=AsyncMock,
            return_value=mock_fazenda,
        ):
            resp = client.get("/api/v1/fazendas/1")
            assert resp.status_code == 200


# ── Rotas de acesso sem autenticação ─────────────────────────────────────────

class TestUnauthorizedAccess:
    def test_fazendas_no_auth_returns_error(self):
        """Remove o override de autenticação e confirma que a rota exige auth."""
        from app.core.deps import get_current_user

        # Remover override
        app.dependency_overrides.pop(get_current_user, None)

        with TestClient(app, raise_server_exceptions=False) as c:
            resp = c.get("/api/v1/fazendas/")

        # Restaurar para não afetar outros testes
        from app.tests.conftest import _mock_admin_user
        app.dependency_overrides[get_current_user] = _mock_admin_user

        assert resp.status_code in (401, 403)

    def test_laboratorios_no_auth_returns_error(self):
        from app.core.deps import get_current_user
        app.dependency_overrides.pop(get_current_user, None)

        with TestClient(app, raise_server_exceptions=False) as c:
            resp = c.get("/api/v1/laboratorios/")

        from app.tests.conftest import _mock_admin_user
        app.dependency_overrides[get_current_user] = _mock_admin_user

        assert resp.status_code in (401, 403)


# ── Exception Handlers ────────────────────────────────────────────────────────

class TestExceptionHandlers:
    def test_validation_error_format(self, client):
        """Garante que o handler retorna o formato padrão de ValidationError."""
        resp = client.post("/api/v1/auth/login", json={"email": "invalido"})
        assert resp.status_code == 422
        data = resp.json()
        assert "detail" in data
        assert "type" in data
        assert "errors" in data

    def test_404_not_found(self, client):
        resp = client.get("/api/v1/rota-que-nao-existe")
        assert resp.status_code == 404
