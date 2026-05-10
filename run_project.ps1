# Automacao de Startup — AgroGemini

Write-Host "--- Iniciando AgroGemini ---" -ForegroundColor Cyan

# 0. Verificar Docker
Write-Host "[0/3] Verificando Docker..." -ForegroundColor Yellow
docker info >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: O Docker nao parece estar rodando." -ForegroundColor Red
    Write-Host "Por favor, abra o Docker Desktop e aguarde ele iniciar antes de rodar este script." -ForegroundColor White
    exit
}

# 1. Banco de Dados
Write-Host "[1/3] Subindo Banco de Dados (Docker)..." -ForegroundColor Yellow
cd db
docker-compose up -d
cd ..

# Aguardar registro do servico
Write-Host "...aguardando Oracle estabilizar..." -ForegroundColor Gray
Start-Sleep -s 15

# Migracoes e Features Oracle
Write-Host "[1.1/3] Sincronizando Esquema e Triggers..." -ForegroundColor Yellow
cd backend
.\venv\Scripts\python.exe -m alembic upgrade head

# Garantir Privilegios (Necessario para Contextos/VPD)
Write-Host "...garantindo privilegios de contexto..." -ForegroundColor Gray
echo "ALTER SESSION SET CONTAINER = freepdb1; GRANT CREATE ANY CONTEXT TO AGROGEMINI;" > grant_tmp.sql
Get-Content grant_tmp.sql | docker exec -i agrogemini-oracle sqlplus / as sysdba
Remove-Item grant_tmp.sql

# Aplicar Triggers e Packages
Write-Host "...aplicando triggers e packages de seguranca..." -ForegroundColor Gray
Get-Content app/db/reapply_oracle_features.sql | docker exec -i agrogemini-oracle sqlplus AGROGEMINI/AgroGemini123@localhost:1521/freepdb1
cd ..

# 2. Backend
Write-Host "[2/3] Iniciando Backend (FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; ./venv/Scripts/activate; uvicorn app.main:app --reload"

# 3. Frontend
Write-Host "[3/3] Iniciando Frontend (Vite)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "SUCCESS: Tudo pronto! Acesse http://localhost:5173" -ForegroundColor Green
