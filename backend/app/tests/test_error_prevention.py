import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.deps import get_current_user

# Mock authentication
async def mock_get_current_user():
    return {"id": 1, "tipo_usuario": "ADM"}

app.dependency_overrides[get_current_user] = mock_get_current_user

def test_create_fazenda_invalid_cnpj():
    """Test if the API rejects a mathematically invalid CNPJ with transparent JSON."""
    with TestClient(app) as client:
        payload = {
            "nome": "Fazenda de Teste Erro",
            "cpf_cnpj": "11111111111111", # Invalid checksum
            "area_total_ha": 100.5
        }
        response = client.post("/api/v1/fazendas/", json=payload)
        
        assert response.status_code == 422
        data = response.json()
        assert data["type"] == "ValidationError"
        assert "inválido matematicamente" in str(data["errors"])

def test_login_missing_fields():
    """Test if missing fields are caught and returned as structured JSON."""
    with TestClient(app) as client:
        payload = {"email": "admin@agrogemini.com"} # Missing password
        response = client.post("/api/v1/auth/login", json=payload)
        
        assert response.status_code == 422
        data = response.json()
        assert data["type"] == "ValidationError"
        assert "detail" in data
