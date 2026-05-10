# Credenciais de Acesso - AgroGemini (Ambiente de Teste)

Para todos os novos usuários criados via **Seed Python**, utilize a senha padrão abaixo:

**Senha Padrão: `Senha123!`**

| Perfil | Nome | Email | Tipo |
|---|---|---|---|
| **Admin do Sistema** | Admin Sistema | admin@agrogemini.com | ADM |
| **Laboratório (Dono)** | Lab Premium | lab.premium@agrogemini.com | UP |
| **Laboratório (Técnico)** | Lab Gratis | lab.gratis@agrogemini.com | UC |
| **Produtor (Premium)** | Produtor Premium | produtor.premium@agrogemini.com | UE |
| **Produtor (Grátis)** | Produtor Gratis | produtor.gratis@agrogemini.com | UE |

---

## Como Popular o Banco
Para carregar estes dados e as tabelas de inteligência, execute:
```powershell
cd backend
.\venv\Scripts\python.exe -m app.db.seed
```
