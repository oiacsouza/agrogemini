import asyncio
import httpx
from app.core.security import create_access_token

async def test():
    token = create_access_token({"sub": "56"})  # Use the user ID from the test output
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        resp = await client.get(
            "/api/v1/laudos/",
            headers={"Authorization": f"Bearer {token}"}
        )
        print(f"Status: {resp.status_code}")
        print(f"Body: {resp.text}")

asyncio.run(test())
