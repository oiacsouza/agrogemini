import asyncio
import logging
import random
from datetime import datetime, timedelta, date

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.usuario import Usuario, TelefoneUsuario
from app.models.endereco import Endereco
from app.models.fazenda import Fazenda, FazendaUsuario
from app.models.talhao import Talhao
from app.models.laboratorio import Laboratorio, LaboratorioUsuario, TelefoneLaboratorio
from app.models.comercial import PlanoAssinatura, Assinatura
from app.models.amostra_laudo import Importacao, Amostra, Laudo, LaudoResultado
from app.models.inteligencia import ConfiguracaoCalculo, VariavelCalculo, LimiteReferencia
from app.models.auditoria_arquivos import EventoAuditoria, Arquivo
from app.models.admin import AdminMetricaConsolidada, FaturamentoHistorico
from app.models.permissoes import PermissaoSistema, UsuarioPermissao

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def gen_numeric_str(length: int) -> str:
    return "".join([str(random.randint(0, 9)) for _ in range(length)])

async def seed_db():
    async with AsyncSessionLocal() as session:
        try:
            logger.info("INICIANDO SEED V7 (Lógica Relacional Consistente para Portal Produtor e Labs)...")

            # 1. PLANOS
            planos_dados = [
                ("FREE", 0.00, 10, 1, "N", "Plano gratuito para lab e produtor"),
                ("PREMIUM LAB", 1299.90, 5000, 50, "Y", "Plano premium para laboratório"),
                ("PREMIUM PROD", 199.90, 500, 5, "N", "Plano premium para produtor"),
                ("FUNCIONARIO LAB", 0.00, 0, 1, "N", "Acesso restrito a funcionarios do lab"),
                ("ADM-PLAN", 0.00, 999999, 999, "Y", "Plano administrativo do sistema"),
                ("FILIAL LAB", 499.90, 500, 10, "Y", "Acesso para filiais de lab")
            ]
            
            pl_free = None
            pl_premium_lab = None
            pl_filial = None
            
            for p_tipo, p_valor, p_amostras, p_usuarios, p_api, p_desc in planos_dados:
                existing = (await session.execute(
                    select(PlanoAssinatura).where(PlanoAssinatura.tipo == p_tipo)
                )).scalars().first()
                if not existing:
                    novo = PlanoAssinatura(tipo=p_tipo, valor=p_valor, limite_amostras=p_amostras, limite_usuarios=p_usuarios, permite_api=p_api, ativo="Y", descricao=p_desc)
                    session.add(novo)
                    if p_tipo == "FREE": pl_free = novo
                    if p_tipo == "PREMIUM LAB": pl_premium_lab = novo
                    if p_tipo == "FILIAL LAB": pl_filial = novo
                else:
                    if p_tipo == "FREE": pl_free = existing
                    if p_tipo == "PREMIUM LAB": pl_premium_lab = existing
                    if p_tipo == "FILIAL LAB": pl_filial = existing
            await session.flush()
            logger.info("1. Planos sincronizados.")

            # 2. PERMISSOES (20)
            existing_perms = (await session.execute(select(func.count()).select_from(PermissaoSistema))).scalar_one()
            permissoes = []
            if existing_perms < 20:
                for i in range(1, 21):
                    p = PermissaoSistema(codigo=f"PERM_{i}", nome=f"Permissao {i}", modulo="SISTEMA", descricao="Seed")
                    session.add(p)
                    permissoes.append(p)
                permissoes[0].codigo, permissoes[0].nome = "DASHBOARD_ADM_VER", "Ver Dashboard Admin"
                permissoes[1].codigo, permissoes[1].nome = "FINANCEIRO_VER", "Ver Financeiro"
                permissoes[2].codigo, permissoes[2].nome = "LAUDO_EDITAR", "Editar Laudos"
                await session.flush()
                logger.info("2. Permissões criadas (20).")
            else:
                permissoes = (await session.execute(select(PermissaoSistema).limit(20))).scalars().all()

            # 3. ENDEREÇOS (20)
            existing_ends = (await session.execute(select(func.count()).select_from(Endereco))).scalar_one()
            enderecos = []
            if existing_ends < 20:
                for i in range(1, 21):
                    e = Endereco(cep=f"74000{i:03d}", logradouro=f"Rua Teste {i}", numero=str(i), bairro="Centro", cidade="Goiânia", estado="GO", pais="Brasil")
                    session.add(e)
                    enderecos.append(e)
                await session.flush()
                logger.info("3. Endereços criados (20).")
            else:
                enderecos = (await session.execute(select(Endereco).limit(20))).scalars().all()

            # 4. LABORATORIOS (20: 15 Matrizes, 5 Filiais)
            existing_labs = (await session.execute(select(func.count()).select_from(Laboratorio))).scalar_one()
            labs = []
            if existing_labs < 20:
                for i in range(1, 16):
                    cnpj_val = gen_numeric_str(14)
                    lab = Laboratorio(nome=f"Laboratorio {'Premium' if i <= 10 else 'Free'} {i}", cnpj=cnpj_val, email=f"lab{i}@agrogemini.com", endereco_id=enderecos[i-1].id, ativo="Y", acreditacao_iso17025="Y", tipo_unidade="MATRIZ")
                    session.add(lab)
                    labs.append(lab)
                await session.flush()
                
                for i in range(16, 21):
                    cnpj_val = gen_numeric_str(14)
                    lab = Laboratorio(nome=f"Laboratorio Filial {i}", cnpj=cnpj_val, email=f"lab{i}@agrogemini.com", endereco_id=enderecos[i-1].id, ativo="Y", acreditacao_iso17025="Y", tipo_unidade="FILIAL", laboratorio_pai_id=labs[i-16].id)
                    session.add(lab)
                    labs.append(lab)
                await session.flush()
                logger.info("4. Laboratórios criados (15 Matrizes, 5 Filiais).")
            else:
                labs = (await session.execute(select(Laboratorio).order_by(Laboratorio.id).limit(20))).scalars().all()

            # 5. ASSINATURAS (20)
            existing_ass = (await session.execute(select(func.count()).select_from(Assinatura))).scalar_one()
            assinaturas = []
            if existing_ass < 20:
                for i in range(20):
                    if labs[i].tipo_unidade == "FILIAL":
                        plano_id = pl_filial.id
                    elif i < 10:
                        plano_id = pl_premium_lab.id
                    else:
                        plano_id = pl_free.id
                    ass = Assinatura(laboratorio_id=labs[i].id, plano_id=plano_id, numero_contrato=f"CONT_{i+1}", data_inicio=datetime.now(), data_expiracao=datetime.now()+timedelta(365), status="ATIVA")
                    session.add(ass)
                    assinaturas.append(ass)
                await session.flush()
                logger.info("5. Assinaturas criadas (10 Premium, 5 Free, 5 Filial).")

            # 6. USUARIOS ESTRUTURADOS (20)
            existing_users = (await session.execute(select(func.count()).select_from(Usuario))).scalar_one()
            usuarios = []
            if existing_users < 20:
                pwd = hash_password("Senha123!")
                
                # ADM (1)
                u_admin = Usuario(nome="Admin", sobrenome="Sistema", email="admin@agrogemini.com", senha_hash=pwd, tipo_usuario="ADM", ativo="Y", plano_ativo="ADM-PLAN")
                session.add(u_admin)
                usuarios.append(u_admin)

                # UP - Donos de Lab (10)
                ups = []
                for i in range(10):
                    u = Usuario(nome=f"Gestor", sobrenome=f"Lab {i+1}", email=f"gestor{i+1}@agrogemini.com", senha_hash=pwd, tipo_usuario="UP", ativo="Y", plano_ativo="PREMIUM LAB")
                    session.add(u)
                    usuarios.append(u)
                    ups.append(u)

                # UC - Tecnicos de Lab (4)
                ucs = []
                for i in range(4):
                    u = Usuario(nome=f"Tecnico", sobrenome=f"{i+1}", email=f"tecnico{i+1}@agrogemini.com", senha_hash=pwd, tipo_usuario="UC", ativo="Y", plano_ativo="FUNCIONARIO LAB")
                    session.add(u)
                    usuarios.append(u)
                    ucs.append(u)

                # UE - Produtores (5) -> 3 Premium Prod, 2 Free
                ues = []
                for i in range(5):
                    plano = "PREMIUM PROD" if i < 3 else "FREE"
                    u = Usuario(nome=f"Produtor", sobrenome=f"{i+1}", email=f"produtor{i+1}@agrogemini.com", senha_hash=pwd, tipo_usuario="UE", ativo="Y", plano_ativo=plano)
                    session.add(u)
                    usuarios.append(u)
                    ues.append(u)

                # UL - Usuarios de Laboratorio Institucionais (20)
                uls = []
                for i in range(20):
                    plano = "FILIAL LAB" if labs[i].tipo_unidade == "FILIAL" else "PREMIUM LAB"
                    u = Usuario(nome=f"Institucional", sobrenome=labs[i].nome, email=labs[i].email, senha_hash=pwd, tipo_usuario="UP", ativo="Y", plano_ativo=plano)
                    session.add(u)
                    usuarios.append(u)
                    uls.append(u)

                await session.flush()
                logger.info("6. Usuários criados com lógica hierárquica (40).")
            else:
                usuarios = (await session.execute(select(Usuario).order_by(Usuario.id))).scalars().all()
                ups = [u for u in usuarios if u.tipo_usuario == 'UP' and not u.email.startswith('lab')]
                ucs = [u for u in usuarios if u.tipo_usuario == 'UC']
                ues = [u for u in usuarios if u.tipo_usuario == 'UE']
                uls = [u for u in usuarios if u.email.startswith('lab')]

            # 7. TELEFONES USUARIOS (20)
            existing_tel_u = (await session.execute(select(func.count()).select_from(TelefoneUsuario))).scalar_one()
            if existing_tel_u < 20:
                for i in range(20):
                    session.add(TelefoneUsuario(usuario_id=usuarios[i].id, numero=f"1198888{i:04d}", tipo="MOVEL", whatsapp="Y"))
                await session.flush()
                logger.info("7. Telefones criados (20).")

            # 8. VINCULOS LAB-USUARIO ESTRUTURADOS
            existing_lab_usr = (await session.execute(select(func.count()).select_from(LaboratorioUsuario))).scalar_one()
            if existing_lab_usr < 20:
                v_count = 0
                # UPs gerenciam os labs (2 labs por UP)
                for i, lab in enumerate(labs):
                    # Vincula Institucional (UL) como Administrador (o próprio lab logando)
                    ul = uls[i]
                    session.add(LaboratorioUsuario(laboratorio_id=lab.id, usuario_id=ul.id, papel="ADMINISTRADOR"))
                    v_count += 1

                    up = ups[i % len(ups)]
                    session.add(LaboratorioUsuario(laboratorio_id=lab.id, usuario_id=up.id, papel="ADMINISTRADOR"))
                    v_count += 1
                    
                    # Coloca um Tecnico (UC) em cada lab tbm
                    uc = ucs[i % len(ucs)]
                    session.add(LaboratorioUsuario(laboratorio_id=lab.id, usuario_id=uc.id, papel="TECNICO"))
                    v_count += 1

                    # Vincula Produtores (UE) como CLIENTE nos labs para que possam interagir
                    ue = ues[i % len(ues)]
                    session.add(LaboratorioUsuario(laboratorio_id=lab.id, usuario_id=ue.id, papel="CLIENTE"))
                    v_count += 1
                    
                await session.flush()
                logger.info(f"8. Vínculos LAB-USUARIO estruturados com {v_count} registros.")

            # 9. PERMISSOES USUARIOS (20)
            existing_usr_perms = (await session.execute(select(func.count()).select_from(UsuarioPermissao))).scalar_one()
            if existing_usr_perms < 20:
                for i in range(20):
                    session.add(UsuarioPermissao(usuario_id=usuarios[i].id, permissao_codigo=permissoes[i%20].codigo, estado="CONCEDIDA"))
                await session.flush()

            # 10. METRICAS ADMIN (20)
            existing_metrics = (await session.execute(select(func.count()).select_from(AdminMetricaConsolidada))).scalar_one()
            if existing_metrics < 20:
                for i in range(20):
                    session.add(AdminMetricaConsolidada(data_referencia=date.today() - timedelta(days=15*i), assinantes_ativos=100+i, novas_assinaturas_mes=10, cancelamentos_mes=2, mrr_estimado=50000.00))
                await session.flush()

            # 11. FAZENDAS VINCULADAS APENAS AOS PRODUTORES (UE) (20)
            existing_fazendas = (await session.execute(select(func.count()).select_from(Fazenda))).scalar_one()
            fazendas = []
            if existing_fazendas < 20:
                for i in range(20):
                    cpf_val = gen_numeric_str(11)
                    # Apenas os UEs (Produtores) possuem fazendas.
                    dono = ues[i % len(ues)]
                    faz = Fazenda(nome=f"Fazenda {i+1} do Produtor", cpf_cnpj=cpf_val, area_total_ha=500.0, endereco_id=enderecos[i].id)
                    session.add(faz)
                    fazendas.append((faz, dono)) # Guaramos a tupla (Fazenda, Produtor)
                await session.flush()
                logger.info("11. Fazendas criadas apenas para Produtores (UE) (20).")
            else:
                f_objs = (await session.execute(select(Fazenda).limit(20))).scalars().all()
                fazendas = [(f, ues[i % len(ues)]) for i, f in enumerate(f_objs)]

            # 12. VINCULOS FAZENDA-USUARIO (20)
            existing_faz_usr = (await session.execute(select(func.count()).select_from(FazendaUsuario))).scalar_one()
            if existing_faz_usr < 20:
                for f, dono in fazendas:
                    session.add(FazendaUsuario(fazenda_id=f.id, usuario_id=dono.id, papel="DONO", inicio_vigencia=datetime.now()))
                await session.flush()
                logger.info("12. Produtores vinculados como Donos das Fazendas (20).")

            # 13. TALHOES NAS FAZENDAS (20)
            existing_talhoes = (await session.execute(select(func.count()).select_from(Talhao))).scalar_one()
            talhoes = []
            if existing_talhoes < 20:
                for f, dono in fazendas:
                    tal = Talhao(fazenda_id=f.id, identificacao=f"Talhao da Fazenda {f.id}", tipo_plantio="DIRETO", area=50.0)
                    session.add(tal)
                    talhoes.append((tal, dono)) # Guardamos o dono tbm
                await session.flush()
                logger.info("13. Talhões criados nas Fazendas (20).")
            else:
                t_objs = (await session.execute(select(Talhao).limit(20))).scalars().all()
                talhoes = [(t, ues[i % len(ues)]) for i, t in enumerate(t_objs)]

            # 14 a 17 (Configurações, Limites, Vars, Imports)
            # Simplificando a geração de 20 registros diretos.
            existing_cfgs = (await session.execute(select(func.count()).select_from(ConfiguracaoCalculo))).scalar_one()
            cfgs = []
            if existing_cfgs < 20:
                for i in range(20):
                    cfg = ConfiguracaoCalculo(tipo_laudo="SOLO", descricao=f"Metodo {i+1}", elemento="P", formula_matematica="x*y", versao=1.0, ordem_execucao=i, valido_de=datetime.now(), ativo="Y")
                    session.add(cfg)
                    cfgs.append(cfg)
                await session.flush()
            else:
                cfgs = (await session.execute(select(ConfiguracaoCalculo).limit(20))).scalars().all()

            existing_vars = (await session.execute(select(func.count()).select_from(VariavelCalculo))).scalar_one()
            if existing_vars < 20:
                for i in range(20): session.add(VariavelCalculo(configuracao_id=cfgs[i].id, nome_variavel=f"v{i}", origem_variavel="CONSTANTE", constante_valor=1.5))
                await session.flush()

            existing_limites = (await session.execute(select(func.count()).select_from(LimiteReferencia))).scalar_one()
            if existing_limites < 20:
                for i in range(20): session.add(LimiteReferencia(configuracao_id=cfgs[i].id, classe="ADEQUADO", valor_minimo=10.0, valor_maximo=20.0, versao=1.0))
                await session.flush()

            existing_imports = (await session.execute(select(func.count()).select_from(Importacao))).scalar_one()
            if existing_imports < 20:
                for i in range(20): session.add(Importacao(laboratorio_id=labs[i].id, usuario_id=ups[0].id, nome_arquivo=f"imp.csv", tipo_arquivo="CSV", caminho_arquivo=".", hash_arquivo=f"h{i}", status="PROCESSADO"))
                await session.flush()

            # 18. AMOSTRAS - 100% CONSISTENTES COM PRODUTOR (20)
            existing_amostras = (await session.execute(select(func.count()).select_from(Amostra))).scalar_one()
            amostras = []
            if existing_amostras < 20:
                for i, (talhao, dono) in enumerate(talhoes):
                    am = Amostra(
                        talhao_id=talhao.id, 
                        cliente_id=dono.id, # O DONO DA FAZENDA É O DONO DA AMOSTRA!
                        laboratorio_id=labs[i].id, 
                        codigo_interno=f"AMO_REAL_{i}", 
                        tipo_amostra="SOLO", 
                        data_entrada=datetime.now(), 
                        status="LAUDO_GERADO"
                    )
                    session.add(am)
                    amostras.append(am)
                await session.flush()
                logger.info("18. Amostras criadas com link VERDADEIRO ao Produtor (UE) e ao seu Talhão (20).")
            else:
                amostras = (await session.execute(select(Amostra).limit(20))).scalars().all()

            # 19. LAUDOS (20)
            existing_laudos = (await session.execute(select(func.count()).select_from(Laudo))).scalar_one()
            laudos = []
            if existing_laudos < 20:
                for i in range(20):
                    laud = Laudo(amostra_id=amostras[i].id, laboratorio_id=labs[i].id, tipo_laudo="SOLO", numero_laudo=f"LAUDO_{i}", data_emissao=datetime.now(), status="APROVADO")
                    session.add(laud)
                    laudos.append(laud)
                await session.flush()
            else:
                laudos = (await session.execute(select(Laudo).limit(20))).scalars().all()

            # 20. RESULTADOS (20)
            existing_resultados = (await session.execute(select(func.count()).select_from(LaudoResultado))).scalar_one()
            if existing_resultados < 20:
                for i in range(20): session.add(LaudoResultado(laudo_id=laudos[i].id, parametro="Fosforo", resultado=15.0, ordem_exibicao=i, fora_spec="N"))
                await session.flush()

            # 21, 22, 23 - Tels, Auditoria, Arquivos
            if (await session.execute(select(func.count()).select_from(TelefoneLaboratorio))).scalar_one() < 20:
                for i in range(20): session.add(TelefoneLaboratorio(laboratorio_id=labs[i].id, numero=f"113333{i:04d}", tipo="FIXO"))
                await session.flush()
                
            if (await session.execute(select(func.count()).select_from(EventoAuditoria))).scalar_one() < 20:
                for i in range(20): session.add(EventoAuditoria(tabela_afetada="USUARIOS", registro_id=usuarios[0].id, operacao="LOGIN"))
                await session.flush()

            if (await session.execute(select(func.count()).select_from(Arquivo))).scalar_one() < 20:
                for i in range(20): session.add(Arquivo(laboratorio_id=labs[i].id, tipo_arquivo="PDF_FINAL", nome_original="d.pdf", caminho_arquivo=".", extensao="pdf", tamanho=100))
                await session.flush()

            # 24. FATURAMENTO HISTORICO (20)
            existing_fat = (await session.execute(select(func.count()).select_from(FaturamentoHistorico))).scalar_one()
            if existing_fat < 20:
                base_year = datetime.now().year
                base_month = datetime.now().month
                for i in range(20):
                    y = base_year - ((i + (12 - base_month)) // 12)
                    m = base_month - (i % 12)
                    if m <= 0: m += 12
                    mes_str = f"{y}-{m:02d}"
                    session.add(FaturamentoHistorico(ano_mes=mes_str, receita_mensal=15000.00, receita_esperada=16000.00, crescimento_percentual=5.0))
                await session.flush()

            await session.commit()
            logger.info("SUCCESS: Seed V7 concluído (Lógica de Isolamento Produtor x Fazenda 100% resolvida!).")

        except Exception as e:
            await session.rollback()
            logger.error(f"FATAL: Erro ao rodar seed final: {e}")
            raise e

if __name__ == "__main__":
    asyncio.run(seed_db())
