import asyncio
import logging
import random
from datetime import datetime, timedelta, date

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import AsyncSessionLocal, engine
from app.core.security import hash_password
from app.models.base import Base
from app.models.usuario import Usuario, TelefoneUsuario
from app.models.endereco import Endereco
from app.models.fazenda import Fazenda, FazendaUsuario
from app.models.talhao import Talhao
from app.models.laboratorio import Laboratorio, LaboratorioUsuario, TelefoneLaboratorio
from app.models.comercial import PlanoAssinatura, Assinatura
from app.models.amostra_laudo import Importacao, Amostra, Laudo, LaudoResultado
from app.models.inteligencia import ConfiguracaoCalculo, VariavelCalculo, LimiteReferencia
from app.models.auditoria_arquivos import EventoAuditoria, Arquivo
from app.models.admin import AdminMetricaConsolidada
from app.models.permissoes import PermissaoSistema, UsuarioPermissao

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def gen_numeric_str(length: int) -> str:
    return "".join([str(random.randint(0, 9)) for _ in range(length)])

async def seed_db():
    async with AsyncSessionLocal() as session:
        try:
            logger.info("INICIANDO SEED FINAL V5 (Cobertura Total 23 Tabelas)...")

            # 1. PLANOS
            pl_free = PlanoAssinatura(tipo="BASICO", valor=0.0, limite_amostras=5, limite_usuarios=2, permite_api="N", ativo="Y", descricao="Plano inicial gratuito.")
            pl_premium = PlanoAssinatura(tipo="PREMIUM", valor=499.90, limite_amostras=9999, limite_usuarios=50, permite_api="Y", ativo="Y", descricao="Acesso ilimitado e API.")
            session.add_all([pl_free, pl_premium])
            await session.flush()

            # 2. PERMISSOES
            permissoes = [
                PermissaoSistema(codigo="DASHBOARD_ADM_VER", nome="Ver Dashboard Admin", modulo="ADMIN", descricao="Acesso as metricas globais"),
                PermissaoSistema(codigo="FINANCEIRO_VER", nome="Ver Financeiro", modulo="FINANCEIRO", descricao="Ver faturamento e assinaturas"),
                PermissaoSistema(codigo="LAUDO_EDITAR", nome="Editar Laudos", modulo="OPERACIONAL", descricao="Alterar resultados de analises"),
                PermissaoSistema(codigo="USUARIO_BLOQUEAR", nome="Bloquear Usuarios", modulo="ADMIN", descricao="Desativar contas de acesso"),
                PermissaoSistema(codigo="LAB_CADASTRAR", nome="Cadastrar Laboratorio", modulo="ADMIN", descricao="Criar novos tenants")
            ]
            session.add_all(permissoes)
            await session.flush()

            # 3. ENDEREÇOS (30)
            enderecos = []
            for i in range(30):
                enderecos.append(Endereco(cep=f"74000{i:03d}", logradouro=f"Avenida Rural {i}", numero=str(i), bairro="Zona Industrial", cidade="Rio Verde", estado="GO", pais="Brasil"))
            session.add_all(enderecos)
            await session.flush()

            # 4. LABORATORIOS (20)
            labs = []
            for i in range(20):
                cnpj_val = gen_numeric_str(14)
                labs.append(Laboratorio(nome=f"Laboratorio de Analises {i+1}", cnpj=cnpj_val, email=f"lab{i}@agrogemini.com", endereco_id=enderecos[i].id, ativo="Y", acreditacao_iso17025="Y"))
            session.add_all(labs)
            await session.flush()

            # 5. USUARIOS
            pwd = hash_password("Senha123!")
            u_admin = Usuario(nome="Admin", sobrenome="Sistema", email="admin@agrogemini.com", senha_hash=pwd, tipo_usuario="ADM", ativo="Y", plano_ativo="PREMIUM")
            u_lab_up = Usuario(nome="Gestor", sobrenome="Premium", email="lab.premium@agrogemini.com", senha_hash=pwd, tipo_usuario="UP", ativo="Y")
            u_lab_uc = Usuario(nome="Tecnico", sobrenome="Gratis", email="lab.gratis@agrogemini.com", senha_hash=pwd, tipo_usuario="UC", ativo="Y")
            u_prod_p = Usuario(nome="Produtor", sobrenome="Premium", email="produtor.premium@agrogemini.com", senha_hash=pwd, tipo_usuario="UE", ativo="Y", plano_ativo="PREMIUM")
            u_prod_f = Usuario(nome="Produtor", sobrenome="Gratis", email="produtor.gratis@agrogemini.com", senha_hash=pwd, tipo_usuario="UE", ativo="Y", plano_ativo="FREE")
            all_users = [u_admin, u_lab_up, u_lab_uc, u_prod_p, u_prod_f]
            session.add_all(all_users)
            await session.flush()

            # 6. TELEFONES USUARIOS (20)
            for i in range(20):
                session.add(TelefoneUsuario(usuario_id=all_users[i % 5].id, numero=f"1198888{i:04d}", tipo="MOVEL", whatsapp="Y"))

            # 7. VINCULOS LAB-USUARIO (20)
            for i in range(20):
                session.add(LaboratorioUsuario(laboratorio_id=labs[i].id, usuario_id=u_lab_up.id if i % 2 == 0 else u_lab_uc.id, papel="TECNICO"))

            # 8. PERMISSOES USUARIOS
            session.add(UsuarioPermissao(usuario_id=u_admin.id, permissao_codigo="DASHBOARD_ADM_VER", estado="CONCEDIDA"))
            session.add(UsuarioPermissao(usuario_id=u_prod_f.id, permissao_codigo="LAUDO_EDITAR", estado="NEGADA"))

            # 9. METRICAS ADMIN (6 Meses)
            for i in range(6):
                session.add(AdminMetricaConsolidada(data_referencia=date.today() - timedelta(days=30*i), assinantes_ativos=100+i, novas_assinaturas_mes=10, cancelamentos_mes=2, mrr_estimado=50000.00))

            # 10. FAZENDAS (20)
            fazendas = []
            for i in range(20):
                cpf_val = gen_numeric_str(11)
                fazendas.append(Fazenda(nome=f"Fazenda Boa Vista {i+1}", cpf_cnpj=cpf_val, area_total_ha=500.0, endereco_id=enderecos[i+5].id))
            session.add_all(fazendas)
            await session.flush()

            for i in range(20):
                session.add(FazendaUsuario(fazenda_id=fazendas[i].id, usuario_id=u_prod_p.id if i % 2 == 0 else u_prod_f.id, papel="DONO", inicio_vigencia=datetime.now()))

            # 11. TALHOES (30)
            talhoes = []
            for i in range(30):
                talhoes.append(Talhao(fazenda_id=fazendas[i % 20].id, identificacao=f"Talhao {i+1}", tipo_plantio="DIRETO", area=50.0))
            session.add_all(talhoes)
            await session.flush()

            # 12. CONFIGURACOES CALCULO (20)
            cfgs = []
            for i in range(20):
                cfgs.append(ConfiguracaoCalculo(tipo_laudo="SOLO", descricao=f"Metodo {i+1}", elemento="P", formula_matematica="x*y", versao=1.0, ordem_execucao=i, valido_de=datetime.now(), ativo="Y"))
            session.add_all(cfgs)
            await session.flush()

            # 13. VARIAVEIS (30)
            for i in range(30):
                session.add(VariavelCalculo(configuracao_id=cfgs[i % 20].id, nome_variavel=f"v{i}", origem_variavel="CONSTANTE", constante_valor=1.5))

            # 14. LIMITES (30)
            for i in range(30):
                session.add(LimiteReferencia(configuracao_id=cfgs[i % 20].id, classe="ADEQUADO", valor_minimo=10.0, valor_maximo=20.0, versao=1.0))

            # 15. IMPORTACOES (20)
            imports = []
            for i in range(20):
                imports.append(Importacao(laboratorio_id=labs[i].id, usuario_id=u_lab_up.id, nome_arquivo=f"f{i}.csv", tipo_arquivo="CSV", caminho_arquivo="...", hash_arquivo=f"h{i}", status="PROCESSADO"))
            session.add_all(imports)
            await session.flush()

            # 16. AMOSTRAS (40)
            amostras = []
            for i in range(40):
                amostras.append(Amostra(talhao_id=talhoes[i % 30].id, cliente_id=u_prod_p.id, laboratorio_id=labs[i % 20].id, codigo_interno=f"A{i}", tipo_amostra="SOLO", data_entrada=datetime.now(), status="LAUDO_GERADO"))
            session.add_all(amostras)
            await session.flush()

            # 17. LAUDOS (25)
            laudos = []
            for i in range(25):
                laudos.append(Laudo(amostra_id=amostras[i].id, laboratorio_id=amostras[i].laboratorio_id, tipo_laudo="SOLO", numero_laudo=f"L{i}", data_emissao=datetime.now(), status="APROVADO"))
            session.add_all(laudos)
            await session.flush()

            # 18. LAUDO RESULTADOS (60)
            for i in range(60):
                session.add(LaudoResultado(laudo_id=laudos[i % 25].id, parametro="Fosforo", resultado=15.0, ordem_exibicao=i))

            # 19. ASSINATURAS (20)
            for i in range(20):
                session.add(Assinatura(laboratorio_id=labs[i].id, plano_id=pl_premium.id if i % 2 == 0 else pl_free.id, numero_contrato=f"C{i}", data_inicio=datetime.now(), data_expiracao=datetime.now()+timedelta(365), status="ATIVA"))

            # 20. TELEFONES LABS (25)
            for i in range(25):
                session.add(TelefoneLaboratorio(laboratorio_id=labs[i % 20].id, numero=f"113333{i:04d}", tipo="FIXO"))

            # 21. EVENTOS AUDITORIA (30)
            for i in range(30):
                session.add(EventoAuditoria(tabela_afetada="USUARIOS", registro_id=1, operacao="LOGIN"))

            # 22. ARQUIVOS (25)
            for i in range(25):
                session.add(Arquivo(laboratorio_id=labs[0].id, tipo_arquivo="PDF_FINAL", nome_original=f"doc{i}.pdf", caminho_arquivo="...", extensao="pdf", tamanho=100))

            await session.commit()
            logger.info("SUCCESS: Banco Final V5 populado com cobertura 100%!")

        except Exception as e:
            await session.rollback()
            logger.error(f"FATAL: Erro ao rodar seed final: {e}")
            raise e

if __name__ == "__main__":
    asyncio.run(seed_db())
