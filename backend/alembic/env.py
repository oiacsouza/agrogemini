import asyncio
import os
import sys
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Add the project root to sys.path for app imports
sys.path.append(os.getcwd())

from app.core.config import settings
from app.models.base import Base

# --- IMPORT ALL MODELS TO REGISTER THEM WITH Base.metadata ---
from app.models.usuario import Usuario, TelefoneUsuario
from app.models.endereco import Endereco
from app.models.fazenda import Fazenda, FazendaUsuario
from app.models.talhao import Talhao
from app.models.laboratorio import Laboratorio, LaboratorioUsuario, TelefoneLaboratorio
from app.models.comercial import PlanoAssinatura, Assinatura
from app.models.amostra_laudo import Importacao, Amostra, Laudo, LaudoResultado
from app.models.inteligencia import ConfiguracaoCalculo, VariavelCalculo, LimiteReferencia
from app.models.auditoria_arquivos import EventoAuditoria, Arquivo
from app.models.admin import AdminMetricaConsolidada
from app.models.permissoes import PermissaoSistema, UsuarioPermissao

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Dynamic database URL from settings
# NOTE: Must use ?service_name= to avoid the driver treating it as a SID.
_host_port, _service = settings.DB_DSN.rsplit("/", 1)
DATABASE_URL = (
    f"oracle+oracledb_async://{settings.DB_USER}:{settings.DB_PASSWORD}@{_host_port}/?service_name={_service}"
)
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection):
    context.configure(
        connection=connection, 
        target_metadata=target_metadata,
        # IMPORTANT: Allow skip if exists
        render_as_batch=True
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    """In this scenario we need to create an Engine
    and associate a connection with the context.
    """

    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
