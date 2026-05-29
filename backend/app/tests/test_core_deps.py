"""
Testes unitários – app/core/deps.py
Cobertura: get_current_user, get_current_user_optional, require_role
"""

import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from fastapi.testclient import TestClient
from fastapi import FastAPI, Depends

from app.core.deps import (
    get_current_user,
    get_current_user_optional,
    require_role,
    require_admin,
    require_lab_user,
    require_producer,
    require_any_authenticated,
)
from app.core.security import create_access_token
from app.main import app


def _make_token(user_id: int = 1) -> str:
    return create_access_token({"sub": str(user_id)})


class TestRequireRole:
    """Testa a factory require_role indiretamente via TestClient."""

    def test_admin_can_access_admin_only_route(self, client):
        """Com mock ADM do conftest, a rota admin deve ser acessível."""
        with patch(
            "app.services.admin_service.AdminService.get_all_users",
            new_callable=AsyncMock,
            return_value=[],
        ):
            resp = client.get("/api/v1/admin/usuarios")
            # ADM tem acesso → não é 403
            assert resp.status_code != 403

    def test_non_admin_gets_forbidden(self):
        """Usuário com tipo UC tentando rota de ADM deve receber 403."""
        from app.core.deps import get_current_user

        def mock_uc_user():
            return {
                "id": 2,
                "nome": "User",
                "sobrenome": "Common",
                "email": "uc@test.com",
                "tipo_usuario": "UC",
                "ativo": "Y",
                "plano_ativo": "FREE",
            }

        app.dependency_overrides[get_current_user] = mock_uc_user
        try:
            with TestClient(app, raise_server_exceptions=False) as c:
                resp = c.get("/api/v1/admin/usuarios")
            assert resp.status_code == 403
        finally:
            from app.tests.conftest import _mock_admin_user
            app.dependency_overrides[get_current_user] = _mock_admin_user

    def test_require_role_shortcuts_exist(self):
        """Verifica que os atalhos de role foram criados corretamente."""
        assert callable(require_admin)
        assert callable(require_lab_user)
        assert callable(require_producer)
        assert callable(require_any_authenticated)


class TestGetCurrentUserUnit:
    """Testa a lógica de get_current_user com mocks de deps."""

    @pytest.mark.asyncio
    async def test_no_credentials_raises_401(self):
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=None, db=AsyncMock())
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_invalid_token_raises_401(self):
        creds = MagicMock()
        creds.credentials = "token.invalido.aqui"
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=creds, db=AsyncMock())
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_token_without_sub_raises_401(self):
        """Token sem campo 'sub' deve levantar 401."""
        from app.core.security import create_access_token
        token_no_sub = create_access_token({"role": "ADM"})  # sem sub
        creds = MagicMock()
        creds.credentials = token_no_sub
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=creds, db=AsyncMock())
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_user_not_found_raises_401(self):
        token = create_access_token({"sub": "999"})
        creds = MagicMock()
        creds.credentials = token
        mock_repo = AsyncMock()
        mock_repo.get_by_id = AsyncMock(return_value=None)
        with patch("app.core.deps.UsuarioRepository", return_value=mock_repo):
            with pytest.raises(HTTPException) as exc_info:
                await get_current_user(credentials=creds, db=AsyncMock())
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_inactive_user_raises_403(self):
        token = create_access_token({"sub": "5"})
        creds = MagicMock()
        creds.credentials = token
        mock_user = MagicMock()
        mock_user.ativo = "N"
        mock_user.id = 5
        mock_repo = AsyncMock()
        mock_repo.get_by_id = AsyncMock(return_value=mock_user)
        with patch("app.core.deps.UsuarioRepository", return_value=mock_repo):
            with pytest.raises(HTTPException) as exc_info:
                await get_current_user(credentials=creds, db=AsyncMock())
        assert exc_info.value.status_code == 403

    @pytest.mark.asyncio
    async def test_valid_user_returns_dict(self):
        token = create_access_token({"sub": "1"})
        creds = MagicMock()
        creds.credentials = token
        mock_user = MagicMock()
        mock_user.id = 1
        mock_user.nome = "Admin"
        mock_user.sobrenome = "Teste"
        mock_user.email = "admin@test.com"
        mock_user.tipo_usuario = "ADM"
        mock_user.ativo = "Y"
        mock_user.plano_ativo = "PREMIUM"
        mock_repo = AsyncMock()
        mock_repo.get_by_id = AsyncMock(return_value=mock_user)
        with patch("app.core.deps.UsuarioRepository", return_value=mock_repo):
            result = await get_current_user(credentials=creds, db=AsyncMock())
        assert result["id"] == 1
        assert result["tipo_usuario"] == "ADM"


class TestGetCurrentUserOptional:
    """Testa a variante opcional de get_current_user."""

    @pytest.mark.asyncio
    async def test_no_credentials_returns_none(self):
        result = await get_current_user_optional(credentials=None, db=AsyncMock())
        assert result is None

    @pytest.mark.asyncio
    async def test_invalid_token_returns_none(self):
        creds = MagicMock()
        creds.credentials = "lixo"
        result = await get_current_user_optional(credentials=creds, db=AsyncMock())
        assert result is None

    @pytest.mark.asyncio
    async def test_token_without_sub_returns_none(self):
        token = create_access_token({"role": "ADM"})
        creds = MagicMock()
        creds.credentials = token
        result = await get_current_user_optional(credentials=creds, db=AsyncMock())
        assert result is None

    @pytest.mark.asyncio
    async def test_user_not_found_returns_none(self):
        token = create_access_token({"sub": "999"})
        creds = MagicMock()
        creds.credentials = token
        mock_repo = AsyncMock()
        mock_repo.get_by_id = AsyncMock(return_value=None)
        with patch("app.core.deps.UsuarioRepository", return_value=mock_repo):
            result = await get_current_user_optional(credentials=creds, db=AsyncMock())
        assert result is None

    @pytest.mark.asyncio
    async def test_inactive_user_returns_none(self):
        token = create_access_token({"sub": "5"})
        creds = MagicMock()
        creds.credentials = token
        mock_user = MagicMock()
        mock_user.ativo = "N"
        mock_repo = AsyncMock()
        mock_repo.get_by_id = AsyncMock(return_value=mock_user)
        with patch("app.core.deps.UsuarioRepository", return_value=mock_repo):
            result = await get_current_user_optional(credentials=creds, db=AsyncMock())
        assert result is None

    @pytest.mark.asyncio
    async def test_valid_user_returns_dict(self):
        token = create_access_token({"sub": "1"})
        creds = MagicMock()
        creds.credentials = token
        mock_user = MagicMock()
        mock_user.id = 1
        mock_user.nome = "João"
        mock_user.sobrenome = "Silva"
        mock_user.email = "joao@test.com"
        mock_user.tipo_usuario = "UE "  # com espaço – deve ser normalizado
        mock_user.ativo = "Y"
        mock_user.plano_ativo = "FREE"
        mock_repo = AsyncMock()
        mock_repo.get_by_id = AsyncMock(return_value=mock_user)
        with patch("app.core.deps.UsuarioRepository", return_value=mock_repo):
            result = await get_current_user_optional(credentials=creds, db=AsyncMock())
        assert result is not None
        assert result["id"] == 1
