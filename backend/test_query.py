import asyncio
import httpx
from app.db.database import AsyncSessionLocal
from app.models.amostra_laudo import Amostra, Laudo
from sqlalchemy import select

async def run():
    print("Checking database directly:")
    async with AsyncSessionLocal() as session:
        amostras = (await session.execute(select(Amostra).where(Amostra.cliente_id == 9))).scalars().all()
        print(f"DB Amostras: {len(amostras)}")
        laudos = (await session.execute(select(Laudo))).scalars().all()
        print(f"DB Laudos: {len(laudos)}")
        
    print("\nChecking via API:")
    async with httpx.AsyncClient() as client:
        resp = await client.post("http://localhost:8000/api/v1/auth/login", json={"email": "produtor.premium@agrogemini.com", "senha": "Senha123!"})
        if resp.status_code != 200:
            print("Login falhou:", resp.text)
            return
        
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        resp2 = await client.get("http://localhost:8000/api/v1/amostras/cliente/9", headers=headers)
        print(f"API Amostras: status={resp2.status_code}, data={resp2.text}")
        
        resp3 = await client.get("http://localhost:8000/api/v1/laudos/cliente/9", headers=headers)
        print(f"API Laudos: status={resp3.status_code}, data={resp3.text}")

if __name__ == "__main__":
    asyncio.run(run())
