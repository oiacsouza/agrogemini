import asyncio
from sqlalchemy import text
from app.db.database import AsyncSessionLocal

async def apply_migration():
    print("Aplicando migração 17...")
    with open("/home/zucchi/Projetos/agrogemini/db/migrations/17_faturamento_e_novos_planos.sql", "r") as f:
        sql_content = f.read()
    
    statements = [s.strip() for s in sql_content.split('/') if s.strip()]
    
    async with AsyncSessionLocal() as session:
        for stmt in statements:
            if not stmt: continue
            try:
                print(f"Executando bloco...")
                await session.execute(text(stmt))
            except Exception as e:
                print(f"Erro no bloco: {e}")
        await session.commit()
    print("Migração aplicada com sucesso!")

if __name__ == "__main__":
    asyncio.run(apply_migration())
