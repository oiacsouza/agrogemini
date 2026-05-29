import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.database import AsyncSessionLocal

async def drop_constraints():
    async with AsyncSessionLocal() as session:
        # Find constraint on planos_assinaturas
        res = await session.execute(text("SELECT constraint_name, search_condition_vc FROM user_constraints WHERE table_name = 'PLANOS_ASSINATURAS' AND constraint_type = 'C'"))
        for row in res.fetchall():
            c_name, c_cond = row[0], row[1]
            print(f"PLANOS_ASSINATURAS: {c_name} -> {c_cond}")
            if "TIPO" in c_cond.upper() or "BASICO" in c_cond.upper() or "tipo" in c_cond.lower():
                print(f"Dropping constraint {c_name}")
                await session.execute(text(f"ALTER TABLE planos_assinaturas DROP CONSTRAINT {c_name}"))
        
        # Find constraint on usuarios
        res2 = await session.execute(text("SELECT constraint_name, search_condition_vc FROM user_constraints WHERE table_name = 'USUARIOS' AND constraint_type = 'C'"))
        for row in res2.fetchall():
            c_name, c_cond = row[0], row[1]
            print(f"USUARIOS: {c_name} -> {c_cond}")
            if "PLANO" in c_cond.upper() or "FREE" in c_cond.upper():
                print(f"Dropping constraint {c_name}")
                await session.execute(text(f"ALTER TABLE usuarios DROP CONSTRAINT {c_name}"))
        
        await session.commit()

if __name__ == "__main__":
    asyncio.run(drop_constraints())
