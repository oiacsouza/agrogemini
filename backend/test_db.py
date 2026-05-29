import asyncio
from sqlalchemy import select, update
from app.db.database import AsyncSessionLocal
from app.models.amostra_laudo import Amostra, Laudo
from app.models.fazenda import Fazenda

async def run():
    async with AsyncSessionLocal() as session:
        amostras = (await session.execute(select(Amostra))).scalars().all()
        print(f"Total amostras no banco: {len(amostras)}")
        if amostras:
            print(f"Primeira amostra cliente_id: {amostras[0].cliente_id}")
            
        # Corrigir o CPF da fazenda para um valido
        await session.execute(update(Fazenda).values(cpf_cnpj="11144477735"))
        await session.commit()
        print("Fazenda CPF atualizado.")

if __name__ == "__main__":
    asyncio.run(run())
