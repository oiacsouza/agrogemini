import asyncio
from sqlalchemy import text
from app.db.database import AsyncSessionLocal

async def check_revenue():
    async with AsyncSessionLocal() as session:
        # Check active lab subscriptions
        sql1 = """
            SELECT SUM(pa.valor) 
            FROM assinaturas a
            JOIN planos_assinaturas pa ON a.plano_id = pa.id
            WHERE a.status = 'ATIVA'
        """
        res1 = await session.execute(text(sql1))
        lab_rev = res1.scalar() or 0.0
        
        # Check premium producers
        sql2 = "SELECT COUNT(*) FROM usuarios WHERE tipo_usuario = 'UE' AND plano_ativo = 'PREMIUM'"
        res2 = await session.execute(text(sql2))
        premium_prod = res2.scalar() or 0
        
        print(f"Lab revenue: {lab_rev}")
        print(f"Premium producers: {premium_prod}")

if __name__ == "__main__":
    asyncio.run(check_revenue())
