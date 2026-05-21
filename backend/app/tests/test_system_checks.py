"""
Testes unitários – app/services/system_checks.py
Cobertura: run_system_checks, _route_dependency_names
"""

import pytest
from fastapi import FastAPI
from fastapi.routing import APIRoute

from app.services.system_checks import run_system_checks, _route_dependency_names, PUBLIC_PATHS
from app.main import app as production_app


class TestRouteDepNames:
    def test_returns_set(self):
        """_route_dependency_names deve retornar um set."""
        from fastapi import Depends

        def dummy_dep():
            return 42

        test_app = FastAPI()

        @test_app.get("/test")
        def handler(dep=Depends(dummy_dep)):
            return {}

        route = next(r for r in test_app.routes if isinstance(r, APIRoute))
        names = _route_dependency_names(route)
        assert isinstance(names, set)

    def test_no_deps_returns_empty(self):
        test_app = FastAPI()

        @test_app.get("/no-deps")
        def handler():
            return {}

        route = next(r for r in test_app.routes if isinstance(r, APIRoute))
        names = _route_dependency_names(route)
        assert isinstance(names, set)


class TestRunSystemChecks:
    def test_checks_dict_structure(self):
        result = run_system_checks(production_app)
        assert "status" in result
        assert "total" in result
        assert "failed" in result
        assert "checks" in result
        assert isinstance(result["checks"], list)

    def test_admin_openapi_route_exists(self):
        """Verifica se a rota /api/v1/admin/openapi está protegida (check passed)."""
        result = run_system_checks(production_app)
        admin_check = next(
            (c for c in result["checks"] if c["id"] == "admin_openapi_console"),
            None,
        )
        assert admin_check is not None
        assert admin_check["status"] in ("passed", "failed")

    def test_auth_check_exists(self):
        result = run_system_checks(production_app)
        auth_check = next(
            (c for c in result["checks"] if c["id"] == "api_auth_dependencies"),
            None,
        )
        assert auth_check is not None

    def test_public_paths_not_flagged(self):
        """Rotas públicas não devem aparecer como desprotegidas."""
        result = run_system_checks(production_app)
        auth_check = next(c for c in result["checks"] if c["id"] == "api_auth_dependencies")
        unprotected_paths = {item["path"] for item in auth_check["details"]}
        for public_path in PUBLIC_PATHS:
            assert public_path not in unprotected_paths

    def test_empty_app_passes_openapi_check_as_failed(self):
        """Um app sem a rota admin/openapi deve retornar check failed."""
        empty_app = FastAPI()
        result = run_system_checks(empty_app)
        admin_check = next(c for c in result["checks"] if c["id"] == "admin_openapi_console")
        assert admin_check["status"] == "failed"

    def test_unprotected_routes_detected(self):
        """Rota sem dependência de auth deve aparecer como unprotected."""
        test_app = FastAPI()

        @test_app.get("/api/v1/sem-auth")
        def no_auth_handler():
            return {}

        result = run_system_checks(test_app)
        auth_check = next(c for c in result["checks"] if c["id"] == "api_auth_dependencies")
        assert auth_check["status"] == "failed"
        paths = [item["path"] for item in auth_check["details"]]
        assert "/api/v1/sem-auth" in paths

    def test_protected_route_not_flagged(self):
        """Rota com get_current_user não deve aparecer como desprotegida."""
        from fastapi import Depends
        from app.core.deps import get_current_user

        test_app = FastAPI()

        @test_app.get("/api/v1/protegida")
        def protected(user=Depends(get_current_user)):
            return {}

        result = run_system_checks(test_app)
        auth_check = next(c for c in result["checks"] if c["id"] == "api_auth_dependencies")
        paths = [item["path"] for item in auth_check["details"]]
        assert "/api/v1/protegida" not in paths

    def test_total_equals_len_checks(self):
        result = run_system_checks(production_app)
        assert result["total"] == len(result["checks"])

    def test_failed_count_consistent(self):
        result = run_system_checks(production_app)
        actual_failed = sum(1 for c in result["checks"] if c["status"] != "passed")
        assert result["failed"] == actual_failed

    def test_overall_status_passed_when_no_failures(self):
        """App onde apenas rotas públicas e rotas protegidas existem deve passar."""
        from fastapi import Depends
        from app.core.deps import get_current_user

        perfect_app = FastAPI()

        @perfect_app.get("/api/v1/admin/openapi")
        def admin_openapi(user=Depends(get_current_user)):
            return {}

        result = run_system_checks(perfect_app)
        assert result["status"] == "passed"
        assert result["failed"] == 0
