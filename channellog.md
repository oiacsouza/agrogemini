# Channel Log

## [2026-04-06] Requisitos - Comandos de Terminal

**Criação do ambiente virtual e instalação de dependências no backend**

Os seguintes comandos de terminal foram orientados ao usuário para configuração do ambiente Python no backend:

- Criar a venv: `python -m venv venv` (ou `python3 -m venv venv`)
- Ativar a venv (Windows): `.\venv\Scripts\Activate.ps1`
- Instalar as dependências do FastAPI (visto em `backend/main.py`): `pip install fastapi uvicorn`
- Salvar dependências no arquivo (opcional): `pip freeze > requirements.txt`

**Solução de Erros (Execution Policies e Pip Não Encontrado)**

Devido ao bloqueio nativo do PowerShell para scripts e a falta do env ativo, foram orientados os comandos:

- Liberar execução de scripts: `Set-ExecutionPolicy Unrestricted -Scope CurrentUser`
- Comando alternativo em caso de falha do pip global (com o env ativado): `python -m pip install fastapi uvicorn`

**Solução de Erros (NPM não reconhecido no Frontend)**

O erro indica que o Node.js não está instalado ou não foi adicionado ao PATH do sistema. Foram orientados os seguintes requisitos:

- Baixar e instalar o Node.js (versão LTS) através do site oficial: https://nodejs.org/
- Após a instalação, reiniciar o terminal (VS Code ou PowerShell) para que o sistema reconheça o executável.
- Reexecutar o comando no frontend: `npm install vite-plugin-mkcert -D`

**Local de instalação do vite-plugin-mkcert**

Indicado ao usuário que a instalação da biblioteca `vite-plugin-mkcert` (usada para fornecer certificados HTTPS para o ambiente de desenvolvimento do Vite) deve ser executada **dentro da pasta `frontend`**. Foi adicionada aos requisitos a instrução de execução:
- Navegar para o diretório: `cd frontend`
- Executar o comando: `npm install vite-plugin-mkcert -D`

**Alteração de Porta Visual e Remoção do :444**

Para acessar a aplicação no domínio `agrogemini.com` de forma limpa (sem o :444), o sistema precisa rodar na porta web segura padrão `443`.
- **Arquivo alterado**: `frontend/vite.config.js`
- **Configuração**: Adicionada a flag `strictPort: true` ao block `server`.
- **Motivo**: O arquivo já possuía `port: 443`, porém estava sendo bloqueada pelo processo nativo do Windows (wslrelay.exe), o que fazia o Vite ignorar a porta ocupada e automaticamente pular para 444 na tentativa de inicialização isolada. Agora o Vite lançará um erro notificando a interrupção ao invés de pular, deixando claro que a porta precisa ser liberada na máquina do usuário para remover a porta da URL.

**Solução de Erros (Porta 443 em uso mesmo após fechar o WSL)**

Caso o erro "Error: Port 443 is already in use" persista pelo bloqueio nativo do sistema do Windows, foi orientado e executado o processo de liberação forçada da porta:
- Descobrir o PID que está ouvindo na porta 443: `netstat -ano | findstr LISTENING | findstr :443`
- Finalizar forçadamente o processo (exemplo se for o WSLRelay): `taskkill /F /PID <NUMERO_DO_PID>`
- Reiniciar o modo de desenvolvedor do frontend na mesma aba: `npm run dev`
