import asyncio
from sqlalchemy import update
from app.db.database import AsyncSessionLocal
from app.models.usuario import Usuario

async def update_passwords():
    valid_hash = "$2b$12$jr/SWZ9BPcMNtwNKOQUAruUnxSYdTuFCs.rezM/LOgwgaq/XtfGMq"
    async with AsyncSessionLocal() as session:
        await session.execute(
            update(Usuario).values(senha_hash=valid_hash)
        )
        await session.commit()
        print("Todas as senhas foram atualizadas para 'Senha123!'")

if __name__ == "__main__":
    asyncio.run(update_passwords())
