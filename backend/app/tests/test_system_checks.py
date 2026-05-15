from app.main import app
from app.services.system_checks import run_system_checks


def test_system_checks_shape():
    result = run_system_checks(app)

    assert "status" in result
    assert "checks" in result
    assert result["total"] == len(result["checks"])
