from fastapi import APIRouter, Depends

from app.db.database import get_db_connection
from app.core.deps import get_current_user
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.services.auth_service import AuthService

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
