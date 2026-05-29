import asyncio
from sqlalchemy import select, update
from app.db.database import AsyncSessionLocal
from app.models.usuario import Usuario
from app.models.amostra_laudo import Amostra, Laudo
from app.models.laboratorio import LaboratorioUsuario
from app.models.fazenda import FazendaUsuario

async def run():
    async with AsyncSessionLocal() as session:
        user = (await session.execute(select(Usuario).where(Usuario.email == "produtor.premium@agrogemini.com"))).scalars().first()
        if user:
            print(f"Produtor premium ID: {user.id}")
            # Update all amostras to belong to this producer
            await session.execute(update(Amostra).values(cliente_id=user.id))
            
            # Also update fazenda_usuarios so the producer sees the farms
            await session.execute(update(FazendaUsuario).values(usuario_id=user.id))
            
            lab_user = (await session.execute(select(Usuario).where(Usuario.email == "lab.premium@agrogemini.com"))).scalars().first()
            if lab_user:
                print(f"Lab premium ID: {lab_user.id}")
                lab_usr = (await session.execute(select(LaboratorioUsuario).where(LaboratorioUsuario.usuario_id == lab_user.id))).scalars().first()
                if lab_usr:
                    print(f"Lab premium Lab ID: {lab_usr.laboratorio_id}")
                    await session.execute(update(Amostra).values(laboratorio_id=lab_usr.laboratorio_id))
                    await session.execute(update(Laudo).values(laboratorio_id=lab_usr.laboratorio_id))

            await session.commit()
            print("Updated Amostras, Fazendas and Laudos to belong to the premium users for testing.")

if __name__ == "__main__":
    asyncio.run(run())
