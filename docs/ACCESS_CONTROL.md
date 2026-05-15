# Controle de Acesso, Usuários e Hierarquia

## Autenticação

- Toda área protegida no frontend passa pelo `AuthGuard`.
- O `AuthGuard` valida a sessão no backend usando `/api/v1/auth/me` antes de renderizar a tela.
- `tipo_usuario` é normalizado em maiúsculas no frontend e no backend.
- Tokens e dados de sessão ficam em `sessionStorage`; dados antigos em `localStorage` são limpos.

## Redirecionamento por perfil

- `ADM` -> `#admin`
- `UP`/`UC` -> `#lab`
- `UE` -> `#produtor`
- perfis desconhecidos -> `#landing`

Não há redirecionamento global fixo para admin. A navegação depende do role autenticado.

## Usuário base

Toda pessoa autenticável deve existir em `usuarios`.

- laboratório principal: `laboratorios.usuario_id`
- funcionário de laboratório: `laboratorio_usuarios.usuario_id`
- cliente/produtor: `usuarios.tipo_usuario = 'UE'` e vínculo `laboratorio_usuarios.papel = 'CLIENTE'`

## Hierarquia de laboratório

Campos estruturais em `laboratorios`:

- `usuario_id`: usuário principal/dono
- `laboratorio_pai_id`: pai imediato
- `tipo_unidade`: `MATRIZ` ou `FILIAL`

O serviço `LabAccessService` calcula os laboratórios visíveis:

- admin vê todos
- usuário de lab vê seus vínculos diretos, descendentes e pai imediato
- métricas usam o laboratório selecionado mais descendentes visíveis

## Migrações necessárias

Execute no banco existente:

- `db/migrations/15_allow_lab_client_role.sql`
- `db/migrations/16_laboratorio_hierarchy.sql`

Em rebuild completo, `db/migrations/99_run_all.sql` já inclui essas etapas.

## Console admin e checks

O painel admin possui:

- catálogo de endpoints via `/api/v1/admin/openapi`
- console interno para chamadas autenticadas
- execução de checks via `/api/v1/admin/system-checks`

CLI equivalente:

```bash
cd backend
python -m app.tests.run_system_checks
```
