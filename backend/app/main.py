"""
CircularTech AI — FastAPI Application Entrypoint
Exposes vision classification, explainable recovery recommendations,
and system health check endpoints.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routes import predict, recommend
from backend.app.services.classifier import classifier_service

app = FastAPI(
    title="CircularTech AI — E-Waste Recovery Intelligence API",
    description=(
        "Transparent decision-support and visual categorization system for electronic waste. "
        "Evaluates repair, reuse, resale, and authorized recycling pathways."
    ),
    version="1.0.0"
)

# Enable CORS for local Next.js frontend development and production hosting
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(predict.router)
app.include_router(recommend.router)

@app.get("/health", tags=["System"])
@app.get("/api/v1/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "CircularTech AI Intelligence Service",
        "version": "1.0.0",
        "model_loaded": classifier_service.is_loaded,
        "model_name": classifier_service.model_name,
        "supported_classes": classifier_service.class_names
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
