# AgroGemini Oracle Local (Docker)

## Pré-requisitos
- Docker Engine 24+
- Docker Compose v2 (`docker compose`)
- `make`

## Estrutura
- `db/docker-compose.yml`: sobe Oracle Database Free 23c (`gvenzl/oracle-free:23-slim`)
- `db/Makefile`: automação de subir, derrubar, resetar e migrar
- `db/migrations/`: scripts SQL separados por responsabilidade

## Credenciais e conexão
- Host: `localhost`
- Porta: `1521`
- Service name: `FREEPDB1`
- Usuário: `AGROGEMINI`
- Senha: `AgroGemini123`

URL JDBC (DBeaver):
`jdbc:oracle:thin:@localhost:1521/FREEPDB1`

## Subir banco
No diretório `db`:

```bash
make up
```

Isso inicia o container e espera o schema `AGROGEMINI` aceitar conexões.

## Rodar migration completa
No diretório `db`:

```bash
make migrate
```

O alvo executa `db/migrations/99_run_all.sql`, que chama os scripts `00` a `12` em ordem numérica.

## Abrir SQL*Plus
No diretório `db`:

```bash
make sqlplus
```

## Derrubar ambiente
No diretório `db`:

```bash
make down
```

## Resetar banco (apaga volume + recria + migra)
No diretório `db`:

```bash
make reset
```

## Conectar no DBeaver
1. Nova conexão Oracle.
2. Informe host `localhost`, porta `1521`, service name `FREEPDB1`.
3. Usuário `AGROGEMINI` e senha `AgroGemini123`.
4. Teste conexão.

## Ordem das migrations
`99_run_all.sql` executa:
1. `00_drops.sql`
2. `01_tabelas_base.sql`
3. `02_tabelas_negocio.sql`
4. `03_tabelas_comercial.sql`
5. `04_tabelas_laboratorial.sql`
6. `05_auditoria.sql`
7. `06_indices.sql`
8. `07_sequences.sql`
9. `08_seed.sql`
10. `09_extensoes_spatial.sql`
11. `10_extensoes_text.sql`
12. `11_vpd_rls.sql`
13. `12_roles_grants.sql`
