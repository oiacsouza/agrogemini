# Documentação do Backend (FastAPI)

## Tecnologias
- **Framework**: FastAPI.
- **ORM**: SQLAlchemy 2.0 (Async).
- **Migrations**: Alembic.
- **Driver**: python-oracledb (Async).

## Arquitetura
- **Routers**: Definição dos endpoints e contratos (Pydantic).
- **Services**: Lógica de negócio e orquestração.
- **Repositories**: Acesso a dados utilizando consultas assíncronas.
- **Core**: Configurações, segurança (JWT) e dependências.

## Endpoints Principais
- `/api/v1/auth`: Login, Registro e Me.
- `/api/v1/fertilizers`: Parsing de laudos e recomendações.
- `/api/v1/amostras`: Gestão de amostras laboratoriais.
