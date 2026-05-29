import asyncio
from sqlalchemy import select
from app.db.database import AsyncSessionLocal
from app.models.usuario import Usuario
from app.models.amostra_laudo import Amostra, Laudo

async def check():
    async with AsyncSessionLocal() as session:
        user = (await session.execute(select(Usuario).where(Usuario.email == 'produtor1@agrogemini.com'))).scalar_one_or_none()
        if not user:
            print("Usuário produtor1@agrogemini.com não encontrado!")
            # Try getting any UE
            users = (await session.execute(select(Usuario).where(Usuario.tipo_usuario == 'UE'))).scalars().all()
            for u in users:
                print(f"Produtor: {u.id} - {u.email}")
            user = users[0] if users else None

        if user:
            amostras = (await session.execute(select(Amostra).where(Amostra.cliente_id == user.id))).scalars().all()
            print(f"Amostras para o usuário {user.id} ({user.email}): {len(amostras)}")
            for a in amostras:
                laudos = (await session.execute(select(Laudo).where(Laudo.amostra_id == a.id))).scalars().all()
                print(f"  Amostra {a.id} -> Laudos: {len(laudos)}")

asyncio.run(check())
