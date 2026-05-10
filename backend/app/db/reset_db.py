import asyncio
import logging
from sqlalchemy import text
from app.db.database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Nuclear Reset: Drops everything in the current schema
RESET_PLSQL = """
BEGIN
    -- Drop Tables
    FOR t IN (SELECT table_name FROM user_tables) LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS PURGE';
    END LOOP;

    -- Drop Sequences
    FOR s IN (SELECT sequence_name FROM user_sequences) LOOP
        EXECUTE IMMEDIATE 'DROP SEQUENCE ' || s.sequence_name;
    END LOOP;

    -- Drop Views
    FOR v IN (SELECT view_name FROM user_views) LOOP
        EXECUTE IMMEDIATE 'DROP VIEW ' || v.view_name;
    END LOOP;
END;
"""

async def reset_db():
    async with engine.begin() as conn:
        logger.info("INICIANDO RESET NUCLEAR DO BANCO (Limpando tudo)...")
        try:
            await conn.execute(text(RESET_PLSQL))
            logger.info("BANCO TOTALMENTE LIMPO!")
        except Exception as e:
            logger.error(f"Erro fatal no reset: {e}")
            raise e

if __name__ == "__main__":
    asyncio.run(reset_db())
