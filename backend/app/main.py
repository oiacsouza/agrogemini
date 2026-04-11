from fastapi import FastAPI

from app.routers import api_router

app = FastAPI(
    title="AgroGemini API",
    version="0.1.0",
    description="Backend API for AgroGemini platform.",
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["root"])
def read_root() -> dict[str, str]:
    return {
        "service": "AgroGemini API",
        "docs": "/docs",
        "healthcheck": "/api/v1/health",
    }

