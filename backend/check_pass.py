import os
import sys

# Append project root
sys.path.append(os.getcwd())

from app.core.config import settings

password = settings.DB_PASSWORD
clean_password = password.strip("'\" \t\n\r")
clean_dsn = settings.DB_DSN.strip("'\" \t\n\r")

import asyncio
import oracledb

async def main():
    try:
        conn = await oracledb.connect_async(
            user=settings.DB_USER,
            password=clean_password,
            dsn=clean_dsn.replace(" ", "")
        )
        print("CONECTADO COM SUCESSO NATIVAMENTE!")
        await conn.close()
    except Exception as e:
        print("FALHA AO CONECTAR NATIVAMENTE:", str(e))

asyncio.run(main())
