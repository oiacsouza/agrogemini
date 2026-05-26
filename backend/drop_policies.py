import asyncio
from sqlalchemy import text
from app.db.database import AsyncSessionLocal

async def drop_policies():
    print("Conectando ao banco para remover as policies VPD...")
    async with AsyncSessionLocal() as session:
        try:
            await session.execute(text("BEGIN DBMS_RLS.DROP_POLICY(USER, 'AMOSTRAS', 'POL_AMOSTRAS_TENANT'); END;"))
            print("Policy de Amostras removida.")
        except Exception as e:
            print(f"Erro ao remover policy AMOSTRAS: {e}")
            
        try:
            await session.execute(text("BEGIN DBMS_RLS.DROP_POLICY(USER, 'LAUDOS', 'POL_LAUDOS_TENANT'); END;"))
            print("Policy de Laudos removida.")
        except Exception as e:
            print(f"Erro ao remover policy LAUDOS: {e}")
            
        await session.commit()
    print("Processo concluído.")

if __name__ == "__main__":
    asyncio.run(drop_policies())
