import asyncio
from app.db.database import AsyncSessionLocal
from sqlalchemy import text

async def run():
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT COUNT(*) FROM amostras"))
        print(f"Count amostras (sql): {result.scalar()}")
        result2 = await session.execute(text("SELECT COUNT(*) FROM fazendas"))
        print(f"Count fazendas (sql): {result2.scalar()}")
        result3 = await session.execute(text("SELECT id, email FROM usuarios"))
        for r in result3:
            print(r)

asyncio.run(run())
