import contextlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import init_db_pool, close_db_pool

# Routers
from app.routers.health import router as health_router
from app.routers.usuario import router as usuario_router
from app.routers.fertilizer import router as fertilizer_router
from app.routers.auth import router as auth_router
from app.routers.endereco import router as endereco_router
from app.routers.laboratorio import router as laboratorio_router
from app.routers.fazenda import router as fazenda_router
from app.routers.talhao import router as talhao_router
from app.routers.amostra import router as amostra_router
from app.routers.laudo import router as laudo_router
from app.routers.importacao import router as importacao_router
from app.routers.dashboard import router as dashboard_router
from app.routers.admin import router as admin_router


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db_pool()
    yield
    await close_db_pool()


app = FastAPI(
    title="AgroGemini API",
    description="Backend API for AgroGemini — Laboratory Information Management System",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(usuario_router)
app.include_router(endereco_router)
app.include_router(laboratorio_router)
app.include_router(fazenda_router)
app.include_router(talhao_router)
app.include_router(amostra_router)
app.include_router(laudo_router)
app.include_router(importacao_router)
app.include_router(dashboard_router)
app.include_router(fertilizer_router)
app.include_router(admin_router)
