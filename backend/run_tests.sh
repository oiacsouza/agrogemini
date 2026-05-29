#!/usr/bin/env bash
# =============================================================================
# run_tests.sh – Instala dependências de teste e executa a suite completa
# Uso: bash run_tests.sh
# =============================================================================

set -e

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PYTHON="$BACKEND_DIR/venv/bin/python3"
OUTPUT_FILE="$BACKEND_DIR/app/tests/suite/TEST_OUTPUT.txt"

echo "============================================================"
echo " AgroGemini – Test Runner"
echo " Backend: $BACKEND_DIR"
echo "============================================================"
echo ""

# ── 1. Verificar venv ──────────────────────────────────────────────────────
if [ ! -f "$VENV_PYTHON" ]; then
    echo "❌ venv não encontrado em $BACKEND_DIR/venv"
    echo "   Crie com: python3 -m venv venv && venv/bin/pip install -r requirements.txt"
    exit 1
fi

echo "✅ venv encontrado: $VENV_PYTHON"
echo ""

# ── 2. Instalar dependências de teste ──────────────────────────────────────
echo "📦 Instalando dependências de teste..."
"$VENV_PYTHON" -m pip install \
    pytest \
    pytest-asyncio \
    pytest-cov \
    httpx \
    aiosqlite \
    --quiet \
    2>&1

echo "✅ Dependências instaladas."
echo ""

# ── 3. Rodar os testes com cobertura ──────────────────────────────────────
echo "🧪 Executando testes..."
echo "   Saída gravada em: $OUTPUT_FILE"
echo ""

mkdir -p "$(dirname "$OUTPUT_FILE")"

"$VENV_PYTHON" -m pytest \
    app/tests/ \
    -v \
    --tb=short \
    --cov=app \
    --cov-report=term-missing \
    --cov-report=html:app/tests/htmlcov \
    --cov-report=xml:app/tests/coverage.xml \
    --cov-config=.coveragerc \
    -p no:warnings \
    --asyncio-mode=auto \
    2>&1 | tee "$OUTPUT_FILE"

EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "============================================================"
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ TODOS OS TESTES PASSARAM"
else
    echo "❌ ALGUNS TESTES FALHARAM (exit code: $EXIT_CODE)"
fi
echo "   Relatório HTML: app/tests/htmlcov/index.html"
echo "   Saída completa: $OUTPUT_FILE"
echo "============================================================"

exit $EXIT_CODE
