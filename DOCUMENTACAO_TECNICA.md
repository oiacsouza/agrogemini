# Documentação Técnica — AgroGemini

## 1. Visão Geral
O AgroGemini é um LIMS (Laboratory Information Management System) especializado em análise de fertilidade de solo e recomendação agronômica, integrando laboratórios, produtores e consultores técnicos.

## 2. Arquitetura do Sistema

### 2.1 Backend (Python/FastAPI)
- **Estrutura:** Baseada em camadas (Routers -> Services -> Repositories).
- **Banco de Dados:** Oracle Database 19c/21c.
- **Autenticação:** JWT (JSON Web Tokens) com Bearer Authentication.
- **Principais Módulos:**
  - auth: Gestão de acesso e perfis.
  - fertilizer: Engine de análise de laudos e geração de recomendações.
  - laboratorio: Gestão de unidades laboratoriais e funcionários.
  - amostra/laudo: Fluxo de processamento de dados técnicos.

### 2.2 Frontend (React/Vite)
- **Estilização:** CSS Vanilla (foco em performance e fidelidade visual).
- **Visualização:** Three.js para o "Digital Twin" das culturas.
- **Estado:** Context API para dados globais e localStorage para persistência de sessão.

### 2.3 Banco de Dados (Oracle)
- **Segurança:** Implementação de VPD (Virtual Private Database) para isolamento multi-tenant.
- **Auditoria:** Triggers de auditoria em tabelas críticas.
- **Geospacial:** Uso de SDO_GEOMETRY para mapeamento de talhões.

## 3. Fluxo de Dados de Análise
1. **Importação:** O laboratório faz upload de arquivos (CSV/PDF) via ImportacaoService.
2. **Parsing:** O fertilizer_parser.py extrai os níveis de NPK, Micronutrientes e Matéria Orgânica.
3. **Recomendação:** O sistema calcula as necessidades de calagem e adubação.
4. **Visualização:** Os resultados são plotados no dashboard do produtor e no modelo 3D do talhão.

## 4. Perfis de Usuário
- **ADM (Administrador):** Gestão global da plataforma e planos.
- **UP (Usuário Principal - Lab):** Gestor do laboratório, controla assinaturas e equipe.
- **UC (Usuário Comum - Lab):** Operacional de entrada de dados e laudos.
- **UE (Usuário Externo - Produtor):** Visualiza resultados e histórico das fazendas.

## 5. Guia de Desenvolvimento
- **Backend:** cd backend && source venv/bin/activate && uvicorn app.main:app --reload
- **Frontend:** cd frontend && npm install && npm run dev
- **Migrações:** Os scripts SQL em db/migrations devem ser executados sequencialmente via 99_run_all.sql.
