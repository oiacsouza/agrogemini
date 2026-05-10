import asyncio
import logging
from sqlalchemy import text
from app.db.database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TABLES = [
    "usuarios", "enderecos", "telefones_usuarios",
    "fazendas", "fazenda_usuarios", "talhoes",
    "laboratorios", "laboratorio_usuarios", "telefones_laboratorios",
    "planos_assinaturas", "assinaturas",
    "importacoes", "amostras", "laudos", "laudo_resultados",
    "configuracoes_calculo", "variaveis_calculo", "limites_referencia",
    "eventos_auditoria", "arquivos"
]

async def inspect_db():
    async with engine.connect() as conn:
        logger.info("--- INSPECAO DE DADOS AGROGEMINI ---")
        
        # 1. Contagem de Linhas por Tabela
        for table in TABLES:
            try:
                result = await conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                status = "✅" if count > 0 else "⚠️ VAZIA"
                print(f"{status} {table.ljust(25)}: {count} registros")
            except Exception as e:
                print(f"❌ {table.ljust(25)}: ERRO ({e})")

        # 2. Amostra de Usuarios
        print("\n--- AMOSTRA DE USUARIOS ---")
        res = await conn.execute(text("SELECT id, email, tipo_usuario, plano_ativo FROM usuarios FETCH FIRST 5 ROWS ONLY"))
        for row in res:
            print(row)

        # 3. Amostra de Relacionamento (Fazenda -> Usuario)
        print("\n--- AMOSTRA RELACIONAL (Fazenda -> Dono) ---")
        res = await conn.execute(text("""
            SELECT f.nome, u.email, fu.papel 
            FROM fazendas f
            JOIN fazenda_usuarios fu ON f.id = fu.fazenda_id
            JOIN usuarios u ON fu.usuario_id = u.id
        """))
        for row in res:
            print(row)

if __name__ == "__main__":
    asyncio.run(inspect_db())
