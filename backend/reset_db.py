import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.database import AsyncSessionLocal

async def reset_db():
    print("Limpando banco de dados para injetar Seed V7 limpo...")
    async with AsyncSessionLocal() as session:
        try:
            # Lista das tabelas na ordem de dependência (deletando filhos primeiro, depois pais)
            tables = [
                "laudo_resultados", "arquivos", "laudos", "amostras", 
                "importacoes", "eventos_auditoria", "variaveis_calculo", 
                "limites_referencia", "configuracoes_calculo", "assinaturas",
                "telefones_laboratorios", "telefones_usuarios", "usuario_permissoes",
                "laboratorio_usuarios", "talhoes", "fazenda_usuarios",
                "fazendas", "laboratorios", "usuarios", "enderecos",
                "permissoes_sistema", "planos_assinaturas", 
                "admin_metricas_consolidadas", "faturamento_historico"
            ]
            for t in tables:
                print(f"Deletando dados da tabela: {t}")
                await session.execute(text(f"DELETE FROM {t}"))
            
            await session.commit()
            print("\nSUCESSO: Todas as tabelas foram esvaziadas com sucesso.")
        except Exception as e:
            await session.rollback()
            print(f"Erro ao limpar tabelas: {e}")

if __name__ == "__main__":
    asyncio.run(reset_db())
