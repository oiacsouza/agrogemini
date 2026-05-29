import asyncio
import httpx
from app.db.database import AsyncSessionLocal
from sqlalchemy import select
from app.models.usuario import Usuario
from app.core.security import create_access_token

async def test():
    async with AsyncSessionLocal() as session:
        user = (await session.execute(select(Usuario).where(Usuario.email == 'gestor1@agrogemini.com'))).scalar_one_or_none()
        if not user:
            print("Usuario gestor1@agrogemini.com não encontrado!")
            return
        token = create_access_token({"sub": str(user.id)})
        
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        resp = await client.get(
            "/api/v1/laboratorios/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        print(f"Status: {resp.status_code}")
        print(f"Body: {resp.text}")

asyncio.run(test())
