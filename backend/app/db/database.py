import oracledb
from app.core.config import settings

pool = None

async def init_db_pool():
    global pool
    if pool is None:
        pool = oracledb.create_pool(
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            dsn=settings.DB_DSN,
            min=1,
            max=5,
            increment=1
        )
    return pool

async def get_db_connection():
    global pool
    if pool is None:
        await init_db_pool()
    connection = pool.acquire()
    try:
        yield connection
    finally:
        pool.release(connection)

async def close_db_pool():
    global pool
    if pool is not None:
        pool.close()
        pool = None
