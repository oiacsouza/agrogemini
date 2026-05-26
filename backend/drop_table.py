import asyncio
from sqlalchemy import text
from app.db.database import AsyncSessionLocal

async def drop_table():
    print("Removendo tabela faturamento_historico para o Alembic recriar...")
    async with AsyncSessionLocal() as session:
        try:
            await session.execute(text("DROP TABLE faturamento_historico CASCADE CONSTRAINTS"))
            await session.commit()
            print("Tabela removida com sucesso!")
        except Exception as e:
            print(f"Erro ao remover: {e}")

if __name__ == "__main__":
    asyncio.run(drop_table())
