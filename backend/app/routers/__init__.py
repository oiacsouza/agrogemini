from fastapi import APIRouter

from app.routers.fertilizer import router as fertilizer_router
from app.routers.health import router as health_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(fertilizer_router)
