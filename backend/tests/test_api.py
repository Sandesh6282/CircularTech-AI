"""
CircularTech AI — FastAPI Endpoints Test Suite
"""

import io
from PIL import Image
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_recommend_endpoint_success():
    payload = {
        "category": "laptop",
        "category_confirmed_by_user": True,
        "functional_condition": "fully_functional",
        "battery": {
            "health_percentage": 90,
            "condition": "good",
            "safety_concern": "none_known"
        },
        "warranty_status": "expired",
        "user_preference": "keep_repair"
    }
    response = client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["pathway"] == "Reuse / Continue using"
    assert "headline" in data
    assert len(data["reasons"]) > 0

def test_recommend_hazard_override():
    payload = {
        "category": "phone",
        "functional_condition": "fully_functional",
        "battery": {
            "condition": "swollen_damaged",
            "safety_concern": "swollen"
        }
    }
    response = client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["pathway"] == "Authorized recycling"
    assert data["safety_alert"] is not None
    assert "CRITICAL SAFETY WARNING" in data["safety_alert"]

def test_predict_category_invalid_file_type():
    file_content = b"fake text content, not an image"
    files = {"file": ("test.txt", file_content, "text/plain")}
    response = client.post("/api/v1/predict-category", files=files)
    assert response.status_code == 400
    assert "Unsupported image type" in response.json()["detail"]

def test_predict_category_valid_synthetic_image():
    # Create small valid synthetic RGB image in memory
    img = Image.new("RGB", (224, 224), color=(73, 109, 137))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    files = {"file": ("sample.jpg", buf.getvalue(), "image/jpeg")}
    response = client.post("/api/v1/predict-category", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_category" in data
    assert "confidence" in data
    assert "top_candidates" in data
    assert "needs_user_confirmation" in data
