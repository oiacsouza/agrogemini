from fastapi import APIRouter, Depends

from app.db.database import get_db_connection
from app.core.deps import get_current_user
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserPlanResponse
from app.services.auth_service import AuthService
from app.repositories.usuario_repository import UsuarioRepository

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db=Depends(get_db_connection)):
    service = AuthService(db)
    return service.login(data)


@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest, db=Depends(get_db_connection)):
    service = AuthService(db)
    return service.register(data)


@router.get("/me")
async def me(current_user=Depends(get_current_user)):
    return current_user


@router.get("/me/plan", response_model=UserPlanResponse)
async def me_plan(
    current_user=Depends(get_current_user),
    db=Depends(get_db_connection),
):
    """Return the effective plan and sample usage for the current user."""
    repo = UsuarioRepository(db)
    tipo = current_user["tipo_usuario"]
    uid = current_user["id"]

    plano = repo.get_user_plan(uid, tipo)

    # For lab users, also get sample usage
    limite_amostras = None
    amostras_usadas = 0
    pode_cadastrar = True

    if tipo in ("UP", "UC"):
        usage = repo.get_lab_sample_usage(uid)
        limite_amostras = usage["limite_amostras"]
        amostras_usadas = usage["amostras_usadas"]
        if plano != "PREMIUM" and limite_amostras and amostras_usadas >= limite_amostras:
            pode_cadastrar = False

    return UserPlanResponse(
        user_id=uid,
        tipo_usuario=tipo,
        plano=plano,
        limite_amostras=limite_amostras,
        amostras_usadas=amostras_usadas,
        pode_cadastrar_amostra=pode_cadastrar,
    )
