from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session
from app.core.deps import require_role, get_current_user
from app.schemas.laboratorio import LaboratorioCreate, LaboratorioUpdate, LaboratorioResponse
from app.services.access_control import LabAccessService
from app.services.laboratorio_service import LaboratorioService
from app.services.usuario_service import UsuarioService
from app.schemas.usuario import UsuarioCreate

router = APIRouter(prefix="/api/v1/laboratorios", tags=["Laboratorios"])

class LabUsuarioCreate(BaseModel):
    nome: str
    sobrenome: str
    email: str
    papel: str
    senha: str

class LabClienteCreate(BaseModel):
    nome: str
    sobrenome: str = " "
    email: str

def normalize_lab_role(value: str) -> str:
    role_map = {
        "admin": "ADMINISTRADOR",
        "administrador": "ADMINISTRADOR",
        "tecnico": "TECNICO",
        "técnico": "TECNICO",
        "gestor": "GESTOR",
        "responsavel_tecnico": "RESPONSAVEL_TECNICO",
        "responsável técnico": "RESPONSAVEL_TECNICO",
        "viewer": "TECNICO",
    }
    normalized = (value or "").strip().lower()
    return role_map.get(normalized, (value or "TECNICO").strip().upper())

@router.get("/", response_model=list[LaboratorioResponse])
async def list_laboratorios(
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("ADM")),
):
    return await LaboratorioService(db).get_all()


@router.get("/me", response_model=list[LaboratorioResponse])
async def list_my_laboratorios(
    db: AsyncSession = Depends(get_db_session),
    current_user=Depends(get_current_user),
):
    """List labs available to the authenticated user."""
    return await LabAccessService(db).visible_labs_for_user(current_user)


@router.get("/{id}", response_model=LaboratorioResponse)
async def get_laboratorio(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    await LabAccessService(db).assert_lab_access(user, id)
    return await LaboratorioService(db).get_by_id(id)


@router.post("/", response_model=LaboratorioResponse)
async def create_laboratorio(
    data: LaboratorioCreate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "ADM")),
):
    service = LaboratorioService(db)
    if user["tipo_usuario"] == "UP":
        return await service.create_for_user(data, user["id"])
    return await service.create(data)


@router.put("/{id}", response_model=LaboratorioResponse)
async def update_laboratorio(
    id: int,
    data: LaboratorioUpdate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "ADM")),
):
    await LabAccessService(db).assert_lab_access(user, id)
    return await LaboratorioService(db).update(id, data)


@router.delete("/{id}")
async def delete_laboratorio(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "ADM")),
):
    await LabAccessService(db).assert_lab_access(user, id)
    return await LaboratorioService(db).delete(id)


@router.get("/{id}/usuarios")
async def get_lab_usuarios(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "ADM")),
):
    await LabAccessService(db).assert_lab_access(user, id)
    return await LaboratorioService(db).get_usuarios(id)


@router.post("/{id}/usuarios")
async def add_lab_usuario(
    id: int,
    data: LabUsuarioCreate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "ADM")),
):
    await LabAccessService(db).assert_lab_access(user, id)
    
    # 1. Check if user already exists
    from app.repositories.usuario_repository import UsuarioRepository
    user_repo = UsuarioRepository(db)
    existing_user = await user_repo.get_by_email(data.email)
    
    lab_service = LaboratorioService(db)
    
    if existing_user:
        # Check if already linked
        existing_vinc = await db.execute(
            select(LaboratorioUsuario)
            .where(LaboratorioUsuario.laboratorio_id == id)
            .where(LaboratorioUsuario.usuario_id == existing_user.id)
        )
        if existing_vinc.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Este usuário já está vinculado a este laboratório.")
        
        user_id = existing_user.id
    else:
        # 2. Create the user
        user_data = UsuarioCreate(
            nome=data.nome,
            sobrenome=data.sobrenome,
            email=data.email,
            senha=data.senha,
            tipo_usuario="UC",  # Typical type for a lab collaborator
            ativo="Y"
        )
        try:
            new_user = await UsuarioService(db).create(user_data)
            user_id = new_user.id
        except HTTPException as e:
            raise e
        except Exception:
            raise HTTPException(status_code=400, detail="Não foi possível criar o usuário. Verifique os dados.")

    # 3. Associate the user with the lab
    try:
        await lab_service.add_usuario(id, user_id, normalize_lab_role(data.papel))
    except Exception:
        # If it's a new user but link failed, we might have a ghost user, 
        # but the unique constraint check above should prevent most cases.
        raise HTTPException(status_code=400, detail="Erro ao vincular usuário ao laboratório.")
    
    return {"message": "Funcionário adicionado com sucesso", "user_id": user_id}


@router.delete("/{id}/usuarios/{user_id}")
async def remove_lab_usuario(
    id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "ADM")),
):
    await LabAccessService(db).assert_lab_access(user, id)
    await LaboratorioService(db).remove_usuario(id, user_id)
    return {"message": "Funcionário removido com sucesso"}


@router.get("/{id}/telefones")
async def get_lab_telefones(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    await LabAccessService(db).assert_lab_access(user, id)
    return await LaboratorioService(db).get_telefones(id)


@router.get("/{id}/clientes")
async def get_lab_clientes(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    """List producers (clients) that have sent samples to this laboratory."""
    await LabAccessService(db).assert_lab_access(user, id)
    return await LaboratorioService(db).get_clientes(id)


@router.post("/{id}/clientes")
async def add_lab_cliente(
    id: int,
    data: LabClienteCreate,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role("UP", "UC", "ADM")),
):
    await LabAccessService(db).assert_lab_access(user, id)
    return await LaboratorioService(db).create_or_link_cliente(
        lab_id=id,
        nome=data.nome,
        sobrenome=data.sobrenome,
        email=data.email,
    )
