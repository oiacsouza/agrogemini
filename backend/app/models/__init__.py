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
