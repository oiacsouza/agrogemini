import contextlib
import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder
from sqlalchemy.exc import SQLAlchemyError

from app.db.database import init_db_pool, close_db_pool

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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


# ── Global Exception Handlers ────────────────────────────────────────────────

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    import traceback
    logger.error(f"Database error: {str(exc)}\n{traceback.format_exc()}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Erro de integridade ou persistência no banco de dados.",
            "type": "DatabaseError",
            "hint": "Verifique se os dados enviados respeitam as restrições do sistema.",
            "debug": str(exc)
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({
            "detail": "Dados de entrada inválidos.",
            "type": "ValidationError",
            "errors": exc.errors()
        }),
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Ocorreu um erro interno inesperado.",
            "type": "InternalServerError",
            "message": str(exc)
        },
    )
