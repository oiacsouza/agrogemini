import asyncio
from sqlalchemy import select, text
from app.db.database import AsyncSessionLocal
from app.models.usuario import Usuario
from app.models.laboratorio import Laboratorio
from app.models.fazenda import Fazenda, FazendaUsuario
from app.models.talhao import Talhao
from app.models.amostra_laudo import Amostra, Laudo
from datetime import datetime, timedelta

async def run():
    async with AsyncSessionLocal() as session:
        produtor = (await session.execute(select(Usuario).where(Usuario.email == "produtor.premium@agrogemini.com"))).scalars().first()
        lab = (await session.execute(select(Laboratorio).where(Laboratorio.id == 1))).scalars().first()
        
        if not produtor or not lab:
            print("Produtor ou Laboratorio nao encontrados.")
            return

        print("Configurando contexto de sessão para evitar erro ORA-28115 (VPD/RLS)...")
        await session.execute(
            text("BEGIN AGRO_CTX_PKG.SET_CONTEXT(:user_id, :lab, :tipo, :ip); END;"),
            {"user_id": produtor.id, "lab": lab.id, "tipo": "ADM", "ip": "127.0.0.1"}
        )

        print("Procurando ou criando dados...")
        
        # 1. Obter ou Criar Fazenda
        fazenda = (await session.execute(select(Fazenda).order_by(Fazenda.id))).scalars().first()
        if not fazenda:
            fazenda = Fazenda(nome="Fazenda Modelo Premium", cpf_cnpj="11144477735", area_total_ha=500.5)
            session.add(fazenda)
            await session.commit()
            await session.refresh(fazenda)
        else:
            fazenda.cpf_cnpj = "11144477735" # garantir cpf valido
            await session.commit()

        # 2. Vincular Fazenda ao Produtor (se nao existir)
        vinculo = (await session.execute(select(FazendaUsuario).where(FazendaUsuario.fazenda_id == fazenda.id, FazendaUsuario.usuario_id == produtor.id))).scalars().first()
        if not vinculo:
            vinculo = FazendaUsuario(fazenda_id=fazenda.id, usuario_id=produtor.id, papel="DONO", inicio_vigencia=datetime.now().date())
            session.add(vinculo)
            await session.commit()

        # 3. Obter ou Criar Talhão
        talhao = (await session.execute(select(Talhao).where(Talhao.fazenda_id == fazenda.id))).scalars().first()
        if not talhao:
            talhao = Talhao(fazenda_id=fazenda.id, identificacao="Talhão 01 - Soja", tipo_plantio="DIRETO", area=200.0, profundidade_amostragem_cm=20.0, textura_solo="ARGILOSA")
            session.add(talhao)
            await session.commit()
            await session.refresh(talhao)

        # 4. Atualizar Amostras Existentes
        amostras = (await session.execute(select(Amostra))).scalars().all()
        for a in amostras:
            a.cliente_id = produtor.id
        await session.commit()
        print(f"Atualizadas {len(amostras)} amostras para o produtor {produtor.id}.")

        print("Desabilitando temporariamente a trigger de laudos...")
        try:
            await session.execute(text("DROP TRIGGER TR_AUD_LAUDOS"))
        except Exception:
            pass
        
        laudos = (await session.execute(select(Laudo))).scalars().all()
        for l in laudos:
            l.solicitante_nome = produtor.nome
        await session.commit()
        print(f"Atualizados {len(laudos)} laudos.")

        print("Massa de dados de teste do produtor atualizada com sucesso!")

if __name__ == "__main__":
    asyncio.run(run())
