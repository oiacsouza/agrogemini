# Relatório de Auditoria Técnica — AgroGemini

Este documento lista as fragilidades técnicas identificadas na arquitetura atual do projeto e as recomendações para mitigação.

## 1. Performance e Concorrência

### 1.1 Bloqueio do Event Loop (Crítico)
- **Status:** Identificado no Backend.
- **Descrição:** O backend utiliza FastAPI (assíncrono), mas as operações de banco de dados e as chamadas nos Repositories são síncronas (`def` em vez de `async def`).
- **Impacto:** O servidor processa uma requisição de banco por vez, travando todo o loop de eventos e degradando a performance sob carga.
- **Recomendação:** Refatorar repositories para `async` e utilizar a interface assíncrona do `python-oracledb`.

### 1.2 Race Condition no Pool de Conexão
- **Status:** Identificado em `app/db/database.py`.
- **Descrição:** A inicialização do pool não possui trava de concorrência.
- **Impacto:** Múltiplas requisições simultâneas no startup podem tentar criar vários pools.
- **Recomendação:** Implementar `asyncio.Lock()` no `init_db_pool`.

## 2. Segurança e Isolamento

### 2.1 Contexto de VPD/RLS Não Aplicado
- **Status:** Identificado na integração Python-Oracle.
- **Descrição:** Embora o banco possua scripts de Row Level Security, o código Python não executa `SET_IDENTIFIER` ou similar ao adquirir uma conexão.
- **Impacto:** Risco de vazamento de dados entre laboratórios/usuários se as políticas de RLS dependerem do contexto da sessão.
- **Recomendação:** Implementar um "Post-Acquire" hook ou comando SQL no `get_current_user` para setar o contexto do usuário.

### 2.2 Política de CORS Permissiva
- **Status:** Identificado em `main.py`.
- **Descrição:** `allow_origins=["*"]` está ativo.
- **Impacto:** Vulnerabilidade a ataques de Cross-Site Request Forgery (CSRF) e falta de controle de acesso à API.
- **Recomendação:** Restringir para domínios específicos em produção.

## 3. Arquitetura de Software

### 3.1 Acoplamento de Serviços e Repositórios
- **Status:** Identificado nos Routers.
- **Descrição:** Serviços são instanciados manualmente dentro das rotas (`service = AuthService(db)`).
- **Impacto:** Dificulta testes unitários (mocking) e viola o princípio de inversão de dependência.
- **Recomendação:** Utilizar o sistema de injeção de dependência do FastAPI para injetar serviços.

### 3.2 Sincronização de Estado no Frontend
- **Status:** Identificado em `api.js`.
- **Descrição:** O estado do usuário é persistido apenas no `localStorage` e não é revalidado com frequência.
- **Impacto:** Mudanças de permissões ou planos no banco não são refletidas no frontend até o logout.
- **Recomendação:** Implementar um hook `useAuth` que valide o token no mount da aplicação.

## 4. Manutenibilidade

### 4.1 Versões Fictícias no Requirements
- **Status:** Identificado em `requirements.txt`.
- **Descrição:** Versões como `fastapi==0.135.2` não condizem com as releases oficiais.
- **Impacto:** Erros de instalação em novos ambientes.
- **Recomendação:** Atualizar para versões reais e estáveis.
