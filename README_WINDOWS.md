# Guia de Instalação e Execução - Windows

Este guia compila os requisitos de histórico do projeto e fornece um passo a passo consolidado para a execução do repositório no sistema operacional Windows.

## 1. Pré-Requisitos e Ferramentas Necessárias

Antes de tudo, garanta que você tenha instalado no seu Windows:
- **Node.js (versão LTS)**: Baixe e instale a partir do site oficial [nodejs.org](https://nodejs.org/). Ele será necessário para rodar e instalar os pacotes do frontend. Após a instalação, feche e abra novamente seu terminal/VS Code.
- **Python**: Instale uma versão recente a partir de [python.org/downloads/](https://www.python.org/downloads/). Não esqueça de marcar a opção *"Add Python to PATH"* durante a instalação.

## 2. Configurando o Visual Studio Code (Extensões)

Para uma melhor experiência de desenvolvimento, recomendamos a instalação das seguintes extensões no seu VS Code:

- **Python (Microsoft)**: Fornece IntelliSense, linting e suporte de execução para Python. (ID: `ms-python.python`)
- **Pylance (Microsoft)**: Suporte avançado de tipagem e autocompletar ao Python. (ID: `ms-python.vscode-pylance`)
- **Prettier - Code formatter**: Para formatação automática do código do Frontend. (ID: `esbenp.prettier-vscode`)
- **ESLint**: Linter para encontrar problemas na sintaxe e padrão do código JavaScript/TypeScript. (ID: `dbaeumer.vscode-eslint`)
- **Tailwind CSS IntelliSense**: Suporte oficial para autocompletar e linting das classes do Tailwind v4. (ID: `bradlc.vscode-tailwindcss`)

*Como instalar:* Abra a aba "Extensions" (Ctrl+Shift+X) no menu esquerdo do VS Code e pesquise pelos nomes (ou IDs) acima, em seguida clique em **Install**.

> [!NOTE]
> **Aviso sobre Tailwind v4 (`@custom-variant`)**: O VSCode nativo pode sublinhar de vermelho diretivas modernas como `@custom-variant dark` no `index.css`. Isso não é um erro de compilação. Para silenciar o linter nativo (caso não utilize a extensão), abra as configurações do seu projeto (`.vscode/settings.json`) e adicione: `"css.lint.unknownAtRules": "ignore"`.

---

## 3. Passo a Passo: Backend (Servidor API)

O backend utiliza a biblioteca `FastAPI` do Python. Nós precisaremos criar um ambiente virtual isolado onde nossas bibliotecas serão instaladas.

1. Abra o terminal integrado do VS Code (ou PowerShell/CMD).
2. Acesse a pasta do backend:
   ```powershell
   cd backend
   ```
3. Crie o ambiente virtual (virtual environment - venv):
   ```powershell
   python -m venv venv
   ```
4. **Solução de Erros de Permissão**: É comum que o Windows bloqueie a ativação de ambientes por questão de segurança de Scripts. Caso seja sua primeira vez, habilite a permissão:
   ```powershell
   Set-ExecutionPolicy Unrestricted -Scope CurrentUser
   ```
5. Ative a sua venv criada (Comando para PowerShell):
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
6. Com ela ativada, faça a instalação das dependências. Se tiver erro com o `pip`, use o formato seguro:
   ```powershell
   python -m pip install fastapi uvicorn
   ```
7. *(Opcional)* Se no futuro precisar salvar as dependências atuais em um arquivo, rode: `pip freeze > requirements.txt`

---

## 4. Passo a Passo: Frontend (Painel Web)

O frontend utiliza Vite e Node.js para rodar.

1. Abra uma **nova aba de terminal** integrada do VS Code (mantenha outra para o backend se for o caso).
2. Entre na pasta do frontend:
   ```powershell
   cd frontend
   ```
3. Instale as dependências padrão (isso requer o Node.js já instalado no PC):
   ```powershell
   npm install
   ```
4. Adicione e instale o plugin de certificado para HTTPs local (vite-plugin-mkcert) requerido pelo projeto:
   ```powershell
   npm install vite-plugin-mkcert -D
   ```
5. Execute seu projeto Frontend com:
   ```powershell
   npm run dev
   ```

Pronto! Seu ambiente estará funcional localmente pelo Windows.

---

## 5. Soluções de Erros (Troubleshooting)

### Erro: Port 443 is already in use (Frontend)
Para garantir que a URL do Vite fique limpa e omita a numeração (`https://agrogemini.com`), o projeto está forçado a usar estritamente a porta web `443` (`strictPort: true` no `vite.config.js`). 
Se o seu terminal acusar que a porta "is already in use", isso significa que o background do Windows (ex: gerenciador do WSL, Docker ou Skype/IIS) está retendo a porta no momento.

**Para resolver forçando a liberação da porta no Windows:**
1. Abra um terminal (PowerShell) e descubra qual rotina está retendo ela:
   ```powershell
   netstat -ano | findstr LISTENING | findstr :443
   ```
2. Um número deve aparecer no final da linha (indicando o PID do programa). Finalize-o com:
   ```powershell
   taskkill /F /PID <NUMERO_DO_PID_AQUI>
   ```
3. Após o encerramento do responsável, inicie seu projeto frontend novamente: `npm run dev`
