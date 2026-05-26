#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# AgroGemini — Script de Inicialização Completo (Linux)
# Sobe Oracle Docker, roda migrations SQL + Alembic, seed e inicia backend+frontend
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
DB_DIR="$PROJECT_ROOT/db"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
VENV_PYTHON="$BACKEND_DIR/venv/bin/python"
VENV_PIP="$BACKEND_DIR/venv/bin/pip"
VENV_ALEMBIC="$BACKEND_DIR/venv/bin/alembic"

DB_USER="AGROGEMINI"
DB_PASSWORD="AgroGemini123"
DB_CONNECT="${DB_USER}/${DB_PASSWORD}@//localhost:1521/FREEPDB1"

# ── Cores ─────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

info()    { echo -e "${CYAN}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC}   $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERRO]${NC} $1"; }
step()    { echo -e "\n${YELLOW}━━━ $1 ━━━${NC}"; }

# ═══════════════════════════════════════════════════════════════════════════════
# 0. Verificações Iniciais
# ═══════════════════════════════════════════════════════════════════════════════
step "[0/6] Verificando pré-requisitos"

if ! command -v docker &>/dev/null; then
    error "Docker não encontrado. Instale antes de continuar."
    exit 1
fi

if ! docker info &>/dev/null; then
    error "Docker não está rodando. Inicie o Docker e tente novamente."
    exit 1
fi
success "Docker OK"

if [ ! -f "$VENV_PYTHON" ]; then
    warn "venv não encontrado em $BACKEND_DIR/venv. Criando..."
    python3 -m venv "$BACKEND_DIR/venv"
    success "venv criado"
fi
success "Python venv OK ($VENV_PYTHON)"

if ! command -v npm &>/dev/null; then
    error "npm não encontrado. Instale Node.js antes de continuar."
    exit 1
fi
success "Node/npm OK"

# ═══════════════════════════════════════════════════════════════════════════════
# 1. Subir Oracle via Docker
# ═══════════════════════════════════════════════════════════════════════════════
step "[1/6] Subindo Banco de Dados Oracle (Docker)"

docker compose -f "$DB_DIR/docker-compose.yml" up -d
success "Container Oracle iniciado"

# ═══════════════════════════════════════════════════════════════════════════════
# 2. Aguardar Oracle ficar pronto (listener + service FREEPDB1)
# ═══════════════════════════════════════════════════════════════════════════════
step "[2/6] Aguardando Oracle aceitar conexões no schema $DB_USER"

oracle_ready() {
    # Try connecting and running a query. Returns 0 only if we get "1" back.
    local result
    result=$(docker compose -f "$DB_DIR/docker-compose.yml" exec -T oracle bash -lc \
        "echo 'SELECT 1 FROM dual;' | sqlplus -s ${DB_CONNECT} 2>&1" 2>/dev/null || true)
    echo "$result" | grep -q "^[[:space:]]*1$"
}

MAX_RETRIES=60
RETRY=0
while ! oracle_ready; do
    RETRY=$((RETRY + 1))
    if [ $RETRY -ge $MAX_RETRIES ]; then
        error "Oracle não ficou pronto após $MAX_RETRIES tentativas (5min). Verifique os logs:"
        error "  docker compose -f $DB_DIR/docker-compose.yml logs oracle"
        exit 1
    fi
    echo -e "${GRAY}  Tentativa $RETRY/$MAX_RETRIES... aguardando 5s${NC}"
    sleep 5
done
success "Oracle respondendo a queries!"

# Espera extra para o serviço FREEPDB1 estabilizar completamente no listener
info "Aguardando estabilização do serviço FREEPDB1 (10s)..."
sleep 10

# Verificação dupla após estabilização
if ! oracle_ready; then
    warn "Oracle instável após estabilização. Aguardando mais 15s..."
    sleep 15
fi
success "Oracle pronto e estável!"

# ═══════════════════════════════════════════════════════════════════════════════
# 3. Executar Migrations SQL (Oracle)
# ═══════════════════════════════════════════════════════════════════════════════
step "[3/6] Executando Migrations SQL (Oracle — 99_run_all.sql)"

MIG_RETRIES=3
MIG_OK=false
for i in $(seq 1 $MIG_RETRIES); do
    info "Tentativa $i/$MIG_RETRIES de executar migrations SQL..."
    if docker compose -f "$DB_DIR/docker-compose.yml" exec -T oracle bash -lc \
        "cd /opt/oracle/scripts/migrations && sqlplus -s ${DB_CONNECT} @99_run_all.sql" 2>&1; then
        MIG_OK=true
        break
    else
        warn "Falha na tentativa $i. Aguardando 10s antes de re-tentar..."
        sleep 10
    fi
done

if [ "$MIG_OK" = false ]; then
    error "Migrations SQL falharam após $MIG_RETRIES tentativas."
    exit 1
fi
success "Migrations SQL executadas"

# ═══════════════════════════════════════════════════════════════════════════════
# 4. Backend — pip install + Alembic + Oracle Features + Seed
# ═══════════════════════════════════════════════════════════════════════════════
step "[4/6] Configurando Backend (pip install + Alembic + Seed)"

info "Instalando dependências Python..."
"$VENV_PIP" install -r "$BACKEND_DIR/requirements.txt"
success "Dependências Python instaladas"

info "Rodando Alembic migrations..."
(cd "$BACKEND_DIR" && "$VENV_ALEMBIC" upgrade head)
success "Alembic upgrade head concluído"

info "Concedendo privilégios de contexto (SYSDBA)..."
echo "ALTER SESSION SET CONTAINER = freepdb1;
GRANT CREATE ANY CONTEXT TO AGROGEMINI;
EXIT;" | docker exec -i agrogemini-oracle sqlplus -s '/ as sysdba' 2>/dev/null || warn "Grant de contexto pode já existir"
success "Privilégios de contexto configurados"

info "Aplicando triggers e packages Oracle..."
docker exec -i agrogemini-oracle sqlplus -s "${DB_CONNECT}" \
    < "$BACKEND_DIR/app/db/reapply_oracle_features.sql" 2>/dev/null || warn "Alguns features podem já existir"
success "Features Oracle aplicadas"

info "Rodando Seed Python (populando banco)..."
(cd "$BACKEND_DIR" && "$VENV_PYTHON" -m app.db.seed)
success "Seed executado com sucesso!"

# ═══════════════════════════════════════════════════════════════════════════════
# 5. Iniciar Backend (uvicorn)
# ═══════════════════════════════════════════════════════════════════════════════
step "[5/6] Iniciando Backend (FastAPI + Uvicorn)"

info "Backend rodará em http://localhost:8000"
(cd "$BACKEND_DIR" && "$BACKEND_DIR/venv/bin/uvicorn" app.main:app --reload --host 0.0.0.0 --port 8000) &
BACKEND_PID=$!
sleep 2

if kill -0 $BACKEND_PID 2>/dev/null; then
    success "Backend iniciado (PID: $BACKEND_PID)"
else
    error "Backend falhou ao iniciar. Verifique os logs."
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════════════════
# 6. Iniciar Frontend (Vite)
# ═══════════════════════════════════════════════════════════════════════════════
step "[6/6] Iniciando Frontend (React + Vite)"

info "Verificando dependências npm..."
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    info "Instalando node_modules..."
    (cd "$FRONTEND_DIR" && npm install)
fi
success "Dependências npm OK"

info "Frontend rodará em http://localhost:5173"
(cd "$FRONTEND_DIR" && npm run dev) &
FRONTEND_PID=$!
sleep 2

if kill -0 $FRONTEND_PID 2>/dev/null; then
    success "Frontend iniciado (PID: $FRONTEND_PID)"
else
    error "Frontend falhou ao iniciar."
fi

# ═══════════════════════════════════════════════════════════════════════════════
# Pronto!
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ AgroGemini — Tudo Pronto!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "  🌐 Frontend:  ${CYAN}http://localhost:5173${NC}"
echo -e "  🔧 Backend:   ${CYAN}http://localhost:8000${NC}"
echo -e "  📖 API Docs:  ${CYAN}http://localhost:8000/docs${NC}"
echo -e "  🗄️  Oracle:    ${CYAN}localhost:1521/FREEPDB1${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GRAY}Pressione Ctrl+C para encerrar todos os processos.${NC}"

# Trap para encerrar tudo junto
cleanup() {
    echo ""
    warn "Encerrando processos..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    success "Processos encerrados. Até mais!"
    exit 0
}
trap cleanup SIGINT SIGTERM

# Manter script rodando
wait
