# Ciclo de Vida do Banco de Dados — AgroGemini

Este guia detalha os procedimentos para gerenciar o esquema e os dados do banco de dados Oracle utilizando o novo sistema de ORM (SQLAlchemy) e Migrations (Alembic).

---

## 1. Reset Total do Banco
Caso precise limpar todos os objetos do banco (tabelas, triggers, constraints) para começar do zero:

```powershell
cd backend
.\venv\Scripts\python.exe -m app.db.reset_db
```
*Este comando executa o script `reset_db.py`, que remove as 20 tabelas e a versão do Alembic, mas mantém seus arquivos de código intactos.*

---

## 2. Sincronização do Esquema (Migrations)

Sempre que você alterar um modelo em `backend/app/models/*.py`, ou após um Reset, siga estes passos:

### Passo A: Gerar Nova Migração
O Alembic comparará seus modelos Python com o que existe no Oracle e gerará um arquivo de instrução.
```powershell
.\venv\Scripts\python.exe -m alembic revision --autogenerate -m "Descricao da mudança"
```

### Passo B: Aplicar no Oracle
Efetiva a criação/alteração das tabelas no banco de dados.
```powershell
.\venv\Scripts\python.exe -m alembic upgrade head
```

---

## 3. População de Dados (Seed)
Para carregar os planos, laboratórios, fazendas e os **usuários de teste** (Admin, Produtor, Técnico):

```powershell
.\venv\Scripts\python.exe -m app.db.seed
```
*As credenciais geradas por este comando estão documentadas em `credenciais_usuarios.md`.*

---

## 4. Comandos de Verificação

| Objetivo | Comando |
| :--- | :--- |
| Ver versão atual do banco | `.\venv\Scripts\python.exe -m alembic current` |
| Ver histórico de migrations | `.\venv\Scripts\python.exe -m alembic history` |
| Voltar uma versão (Downgrade) | `.\venv\Scripts\python.exe -m alembic downgrade -1` |

---

## 🛠️ Notas de Resiliência
- **Docker:** Certifique-se de que o container `agrogemini-oracle` está rodando antes de qualquer comando.
- **Delay do Oracle:** Após subir o Docker, aguarde ~2 minutos para o listener do Oracle registrar o serviço `FREEPDB1`.
- **Skip if Exists:** O sistema foi configurado para ignorar erros caso você tente criar uma tabela que já exista fisicamente, mas não está no histórico do Alembic.
