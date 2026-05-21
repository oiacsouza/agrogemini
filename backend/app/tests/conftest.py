"""
conftest.py – Fixtures compartilhadas para toda a suite de testes do AgroGemini.

Estratégia: sem banco Oracle real.
- O módulo app.db.database é completamente mockado antes de qualquer importação.
- SQLite em memória substitui o Oracle via SQLAlchemy.
- get_db_session e get_current_user são sobrescritos via dependency_overrides.
"""

import sys
import os
from unittest.mock import MagicMock, AsyncMock
import pytest
import pytest_asyncio

# ── PASSO 1: Mockar oracledb ANTES de qualquer import do app ─────────────────
# O oracledb pode não estar instalado no ambiente de CI / test.
# Injetamos um mock no sys.modules para evitar ImportError.
oracledb_mock = MagicMock()
sys.modules.setdefault("oracledb", oracledb_mock)

# ── PASSO 2: Criar engine SQLite em memória ────────────────────────────────────
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

_TEST_ENGINE = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=False,
)
_TestSessionFactory = sessionmaker(
    _TEST_ENGINE, class_=AsyncSession, expire_on_commit=False
)


# ── PASSO 3: Mockar app.db.database antes de ser importado ───────────────────
import types

_db_module = types.ModuleType("app.db.database")
_db_module.engine = _TEST_ENGINE
_db_module.AsyncSessionLocal = _TestSessionFactory
_db_module.DATABASE_URL = "sqlite+aiosqlite:///:memory:"


async def _get_db_session():
    async with _TestSessionFactory() as session:
        yield session


_db_module.get_db_session = _get_db_session
_db_module.get_db_connection = AsyncMock()
_db_module.init_db_pool = AsyncMock()
_db_module.close_db_pool = AsyncMock()

sys.modules["app.db.database"] = _db_module

# ── PASSO 4: Agora é seguro importar o app ────────────────────────────────────
from app.main import app  # noqa: E402
from app.core.deps import get_current_user  # noqa: E402


# ── PASSO 5: Criar tabelas no SQLite (best-effort) ────────────────────────────
@pytest_asyncio.fixture(scope="session", autouse=True)
async def create_tables():
    """Cria as tabelas SQLite em memória para os testes que precisam de ORM."""
    try:
        from app.models.base import Base
        async with _TEST_ENGINE.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception:
        # Se os modelos tiverem tipos específicos do Oracle, ignora silenciosamente
        pass
    yield
    await _TEST_ENGINE.dispose()


# ── Mock do usuário autenticado ───────────────────────────────────────────────
def _mock_admin_user():
    return {
        "id": 1,
        "nome": "Admin",
        "sobrenome": "Teste",
        "email": "admin@agrogemini.com",
        "tipo_usuario": "ADM",
        "ativo": "Y",
        "plano_ativo": "PREMIUM",
    }


# ── Override automático de dependências ──────────────────────────────────────
@pytest.fixture(autouse=True)
def override_dependencies():
    app.dependency_overrides[get_current_user] = _mock_admin_user
    app.dependency_overrides[_get_db_session] = _get_db_session
    yield
    app.dependency_overrides.clear()


# ── TestClient ────────────────────────────────────────────────────────────────
@pytest.fixture
def client():
    from fastapi.testclient import TestClient
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


@pytest.fixture
def admin_user():
    return _mock_admin_user()
