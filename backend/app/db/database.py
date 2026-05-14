import asyncio
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import event, text

from app.core.config import settings

# Connection URL: oracle+oracledb_async://user:password@host:port/?service_name=xxx
# NOTE: The DSN must use ?service_name= to avoid the driver treating it as a SID.
_host_port, _service = settings.DB_DSN.rsplit("/", 1)
DATABASE_URL = (
    f"oracle+oracledb_async://{settings.DB_USER}:{settings.DB_PASSWORD}@{_host_port}/?service_name={_service}"
)

# Async Engine configuration
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

# Session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# ── VPD / RLS Integration ────────────────────────────────────────────────────

@event.listens_for(engine.sync_engine, "connect")
def set_initial_context(dbapi_connection, connection_record):
    """
    Sets initial session context when a new physical connection is created.
    This helps with auditing and basic security at the DB level.
    """
    cursor = dbapi_connection.cursor()
    try:
        # Example: Setting a default module name for auditing in Oracle
        cursor.execute("BEGIN DBMS_APPLICATION_INFO.SET_MODULE('AgroGemini', 'AsyncConnection'); END;")
    finally:
        cursor.close()

# ── Dependencies ─────────────────────────────────────────────────────────────

async def init_db_pool():
    """Dummy for backward compatibility with lifespan, engine is lazy-loaded but we can ping."""
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1 FROM DUAL"))

async def close_db_pool():
    """Close the engine and all connections."""
    await engine.dispose()

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency to provide an async SQLAlchemy session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Legacy / Transition support
async def get_db_connection():
    """
    Temporary compatibility layer. 
    Yields a raw DBAPI connection from the SQLAlchemy engine.
    """
    async with engine.connect() as conn:
        yield conn
