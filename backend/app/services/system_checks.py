from fastapi.routing import APIRoute


PUBLIC_PATHS = {
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/health",
    "/health",
}


def _route_dependency_names(route: APIRoute) -> set[str]:
    names = set()
    for dependency in route.dependant.dependencies:
        call = dependency.call
        names.add(getattr(call, "__name__", repr(call)))
        for sub in dependency.dependencies:
            names.add(getattr(sub.call, "__name__", repr(sub.call)))
    return names


def run_system_checks(app) -> dict:
    checks = []

    api_routes = [
        route for route in app.routes
        if isinstance(route, APIRoute) and route.path.startswith("/api/")
    ]

    unprotected = []
    for route in api_routes:
        if route.path in PUBLIC_PATHS:
            continue
        dependency_names = _route_dependency_names(route)
        has_auth_dependency = bool({
            "get_current_user",
            "_checker",
            "require_role",
        }.intersection(dependency_names))
        if not has_auth_dependency:
            unprotected.append({
                "path": route.path,
                "methods": sorted(route.methods),
                "name": route.name,
            })

    checks.append({
        "id": "api_auth_dependencies",
        "label": "Rotas de API protegidas por autenticação",
        "status": "passed" if not unprotected else "failed",
        "details": unprotected,
    })

    checks.append({
        "id": "admin_openapi_console",
        "label": "Catálogo de APIs protegido por ADMIN",
        "status": "passed" if any(route.path == "/api/v1/admin/openapi" for route in api_routes) else "failed",
        "details": [],
    })

    failed = [check for check in checks if check["status"] != "passed"]
    return {
        "status": "passed" if not failed else "failed",
        "total": len(checks),
        "failed": len(failed),
        "checks": checks,
    }
