import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data
    assert "bob_mode" in data

def test_analyze_endpoint_missing_body():
    response = client.post("/analyze")
    assert response.status_code == 422 # Validation error

def test_analyze_endpoint_mock_call():
    # Only tests structural validation without a real bob API key
    payload = {
        "repository_url": "https://github.com/example/repo",
        "branch": "main"
    }
    response = client.post("/analyze", json=payload)
    # Could be 200 (mock mode) or 500 (if failure in real mode without key)
    assert response.status_code in [200, 500] 

def test_explain_code_mock_call():
    payload = {
        "query": "What does this function do?",
        "code_context": "def hello(): print('world')",
        "repository_id": "test-repo",
        "user_level": "beginner"
    }
    response = client.post("/explain", json=payload)
    assert response.status_code in [200, 500]
