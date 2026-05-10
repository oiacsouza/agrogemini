# Guia de Execução — AgroGemini

Este guia detalha como subir o ambiente completo do AgroGemini de forma segmentada ou utilizando os scripts de automação.

## 🚀 Forma Ágil (Execução Total)

Para rodar tudo com um único comando (requer Docker e Python instalados):

### Windows (PowerShell)
```powershell
./run_project.ps1
```

### Linux/macOS
```bash
chmod +x run_project.sh
./run_project.sh
```

---

## 🛠️ Execução por Partes

### 1. Banco de Dados (Oracle)
O banco roda via Docker para garantir consistência de ambiente.
- **Diretório:** `db/`
- **Comandos:**
  ```bash
  cd db
  docker-compose up -d
  ```
- **Aguarde:** O Oracle leva cerca de 2-3 minutos para inicializar completamente na primeira execução.

### 2. Backend (FastAPI)
- **Diretório:** `backend/`
- **Setup inicial:**
  ```bash
  cd backend
  python -m venv venv
  ./venv/Scripts/activate  # Windows
  source venv/bin/activate # Linux
  pip install -r requirements.txt
  ```
- **Migrações (Alembic):**
  ```bash
  alembic upgrade head
  ```
- **Execução:**
  ```bash
  uvicorn app.main:app --reload
  ```

### 3. Frontend (React + Vite)
- **Diretório:** `frontend/`
- **Setup e Execução:**
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

---

## 📖 Documentação por Camada

- **[Documentação do Banco de Dados](docs/DATABASE.md)**: Esquema, VPD e Triggers.
- **[Documentação do Backend](docs/BACKEND.md)**: API, Repositories e Services.
- **[Documentação do Frontend](docs/FRONTEND.md)**: Componentes, Portais e Digital Twin.
