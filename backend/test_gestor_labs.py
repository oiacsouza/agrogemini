import asyncio
from sqlalchemy import select
from app.db.database import AsyncSessionLocal
from app.models.usuario import Usuario
from app.models.laboratorio import Laboratorio, LaboratorioUsuario

async def check():
    async with AsyncSessionLocal() as session:
        # Find gestor10 (or anyone with multiple labs)
        users = (await session.execute(select(Usuario).where(Usuario.tipo_usuario == 'UP'))).scalars().all()
        for u in users:
            links = (await session.execute(
                select(LaboratorioUsuario)
                .where(LaboratorioUsuario.usuario_id == u.id)
            )).scalars().all()
            
            labs_names = []
            for link in links:
                lab = (await session.execute(select(Laboratorio).where(Laboratorio.id == link.laboratorio_id))).scalar_one()
                labs_names.append(f"{lab.nome} (Papel: {link.papel})")
            
            if len(links) > 0:
                print(f"Gestor: {u.email} -> Labs: {', '.join(labs_names)}")

asyncio.run(check())
