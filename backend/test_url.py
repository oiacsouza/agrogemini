from app.core.config import settings
from sqlalchemy.engine.url import URL

clean_dsn = settings.DB_DSN.strip("'\" \t\n\r")
clean_password = settings.DB_PASSWORD.strip("'\" \t\n\r")

if clean_dsn.upper().startswith("(DESCRIPTION"):
    clean_dsn = clean_dsn.replace(" ", "")
    DATABASE_URL = URL.create(
        "oracle+oracledb_async",
        username=settings.DB_USER,
        password=clean_password,
        host=clean_dsn
    )
    
print("--- TESTE URL DE CONEXAO ---")
print(f"Password in settings: {settings.DB_PASSWORD}")
print(f"Generated URL: {DATABASE_URL}")
print("--- TESTE NATIVO ---")

import asyncio
import oracledb

async def main():
    try:
        conn = await oracledb.connect_async(
            user=settings.DB_USER,
            password=clean_password,
            dsn=clean_dsn
        )
        print("CONECTADO NATIVAMENTE COM AS VARIAVEIS DO .ENV!")
        await conn.close()
    except Exception as e:
        print("FALHA NATIVA:", str(e))

asyncio.run(main())
