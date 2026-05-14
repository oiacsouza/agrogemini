# Histórico do Projeto AgroGemini

## Visão Geral
O AgroGemini é uma plataforma de gestão agronômica projetada para conectar laboratórios de análise de solo/sementes e produtores rurais. O objetivo é automatizar o fluxo de dados, desde a importação de resultados de máquinas até a entrega de laudos técnicos e recomendações de correção para o produtor.

## Linha do Tempo de Desenvolvimento

### Fase 1: Fundação e Arquitetura (Pre-2026)
- Definição do stack tecnológico: FastAPI (Backend), React/Vite (Frontend), Oracle Database (Migrado posteriormente).
- Implementação dos modelos base: Usuários, Fazendas, Laboratórios, Amostras.
- Configuração do sistema de autenticação via JWT.

### Fase 2: Módulo Laboratorial e Cálculos
- Desenvolvimento do motor de importação de arquivos CSV/XLSX.
- Implementação de lógica de normalização de dados de amostras.
- Criação do dashboard laboratorial com visualização de estatísticas e status de processamento.

### Fase 3: Migração para Oracle e Padronização (Maio 2026)
- Migração completa do banco de dados para Oracle 21c/23c (via Docker).
- Refatoração dos repositórios para suporte a SQLAlchemy Async (SQLAlchemy 2.0).
- Padronização das migrations SQL para Oracle (Constraints nomeadas, Sequences, Identidade).

### Fase 4: Integração e Correção de Bugs Críticos (Atual)
- **Correção de Autenticação:** Identificado erro no middleware de dependências (`deps.py`) onde o `await` estava ausente na busca do usuário e o driver de conexão estava defasado.
- **Correção de Frontend:** Resolvido erro de "Tela Branca" no Portal do Laboratório causado por chaves de tradução (`locales.js`) ausentes que eram referenciadas nos componentes de Header e Switcher.
- **Melhoria de UI/UX:** Alinhamento de temas (Dark/Light) e melhoria na consistência das mensagens de erro.

## Status Atual
O projeto está em fase de validação das funcionalidades core (Login, Dashboard Admin, Portal Lab). A integração frontend-backend foi estabilizada após a correção dos middlewares de segurança.

## Próximos Passos
- Implementação completa do gerador de laudos em PDF.
- Expansão do Portal do Produtor com visualizações espaciais (Mapas).
- Refinamento das fórmulas de cálculo agronômico.
