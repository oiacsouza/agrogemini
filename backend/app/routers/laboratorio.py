from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session
from app.core.deps import require_role, get_current_user
from app.schemas.laboratorio import LaboratorioCreate, LaboratorioUpdate, LaboratorioResponse
from app.models.laboratorio import LaboratorioUsuario
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
    """
    Strictly normalizes the role string to match the CK_LAB_USUARIOS_PAPEL constraint:
    'TECNICO','GESTOR','RESPONSAVEL_TECNICO','ADMINISTRADOR','CLIENTE'
    """
    if not value:
        return "TECNICO"
        
    v = value.strip().lower()
    
    # Direct mappings
    if v in ["admin", "administrador", "adm"]:
        return "ADMINISTRADOR"
    if v in ["gestor", "gerente", "manager"]:
        return "GESTOR"
    if v in ["responsavel_tecnico", "rt", "responsável técnico", "responsável"]:
        return "RESPONSAVEL_TECNICO"
    if v in ["cliente", "produtor"]:
        return "CLIENTE"
    if v in ["tecnico", "técnico", "viewer", "funcionario", "funcionário", "colaborador"]:
        return "TECNICO"
        
    # Final check against allowed uppercase set
    allowed = {"TECNICO", "GESTOR", "RESPONSAVEL_TECNICO", "ADMINISTRADOR", "CLIENTE"}
    up = value.strip().upper()
    if up in allowed:
        return up
        
    return "TECNICO"

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
    import logging
    logger = logging.getLogger("agrogemini.debug")
    logger.info(f"Adding user to lab {id}. Data: {data}")
    
    await LabAccessService(db).assert_lab_access(user, id)
    
    # 1. Check if user already exists
    from app.repositories.usuario_repository import UsuarioRepository
    user_repo = UsuarioRepository(db)
    existing_user = await user_repo.get_by_email(data.email)
    
    lab_service = LaboratorioService(db)
    role = normalize_lab_role(data.papel)
    logger.info(f"Normalized role: {role}")
    
    if existing_user:
        logger.info(f"User exists: {existing_user.id}")
        # Check if already linked with ANY role? Or THIS role?
        # Requirement says "Este usuário já possui este papel"
        existing_vinc = await db.execute(
            select(LaboratorioUsuario)
            .where(LaboratorioUsuario.laboratorio_id == id)
            .where(LaboratorioUsuario.usuario_id == existing_user.id)
            .where(LaboratorioUsuario.papel == role)
        )
        if existing_vinc.first():
            logger.warning("Duplicate role link detected")
            raise HTTPException(status_code=400, detail="Este usuário já possui este papel neste laboratório.")
        
        user_id = existing_user.id
    else:
        logger.info("Creating new user...")
        # 2. Create the user
        user_data = UsuarioCreate(
            nome=data.nome,
            sobrenome=data.sobrenome,
            email=data.email,
            senha=data.senha,
            tipo_usuario="UC",  # Collaborator
            ativo="Y"
        )
        try:
            new_user_obj = await UsuarioService(db).create(user_data)
            user_id = new_user_obj.id
            logger.info(f"User created: {user_id}")
        except HTTPException as e:
            logger.error(f"HTTP error creating user: {e.detail}")
            raise e
        except Exception as e:
            logger.error(f"Generic error creating user: {e}", exc_info=True)
            raise HTTPException(status_code=400, detail="Não foi possível criar o usuário. Verifique os dados.")

    # 3. Associate the user with the lab
    try:
        logger.info(f"PRE-LINK: user={user_id}, lab={id}, role={role}")
        await lab_service.add_usuario(id, user_id, role)
        logger.info("POST-LINK: Success")
    except Exception as e:
        import traceback
        # Capture the ORA error from the exception string
        err_str = str(e)
        logger.error(f"LINK FAILURE: {err_str}")
        logger.error(traceback.format_exc())
        
        # Friendly but detailed message for the user/developer
        detail_msg = f"Erro de persistência no Oracle: {err_str}"
        if "ORA-02290" in err_str:
            detail_msg = f"Violação de CHECK CONSTRAINT. Valor '{role}' ou dados do usuário rejeitados."
        elif "ORA-00001" in err_str:
            detail_msg = "Vínculo já existe (Unique Constraint)."
            
        raise HTTPException(status_code=400, detail=detail_msg)
    
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
