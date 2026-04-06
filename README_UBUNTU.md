# Guia de Instalação e Execução - Ubuntu (Linux)

Este guia compila os requisitos de histórico do projeto e fornece um passo a passo consolidado para a execução do repositório no sistema operacional Ubuntu/Linux.

## 1. Pré-Requisitos e Ferramentas Necessárias

No sistema Linux, a forma recomendável de instalar Node.js e Python é diretamente através do seu gerenciador de pacotes nativo (APT) ao invés do site:

**1. Instalar o Node.js v20 (LTS):**
Abra o terminal (`Ctrl` + `Alt` + `T`) e rode os comandos:
```bash
# Adicionar repositório oficial da versão LTS do Node
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar o pacote
sudo apt-get install -y nodejs
```

**2. Instalar o Python e ferramentas associadas (pip e venv):**
Por padrão o Ubuntu costuma ter o Python base (python3) já instalado, porém precisamos do pacote que permite criar ambientes virtuais (venv) e do pip local.
```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv
```

## 2. Configurando o Visual Studio Code (Extensões)

Para uma melhor experiência de desenvolvimento, recomendamos a instalação das seguintes extensões no seu VS Code:

- **Python (Microsoft)**: Fornece IntelliSense, linting e suporte de execução para Python. (ID: `ms-python.python`)
- **Pylance (Microsoft)**: Suporte avançado de tipagem e autocompletar ao Python. (ID: `ms-python.vscode-pylance`)
- **Prettier - Code formatter**: Para formatação automática do código do Frontend. (ID: `esbenp.prettier-vscode`)
- **ESLint**: Linter para encontrar problemas na sintaxe e padrão do código JavaScript/TypeScript. (ID: `dbaeumer.vscode-eslint`)

*Como instalar:* Abra a aba "Extensions" (Ctrl+Shift+X) no menu esquerdo do VS Code e pesquise pelos nomes (ou IDs) acima, em seguida clique em **Install**. 

Se você trabalha pelo WSL e utiliza a versão Ubuntu pelo Windows, o VS Code solicitará para que as extensões acima sejam instaladas no formato de "Install in WSL: Ubuntu". 

---

## 3. Passo a Passo: Backend (Servidor API)

O backend utiliza a biblioteca `FastAPI` do Python e gerencia bibliotecas usando um ambiente virtual (`venv`).

1. Abra o terminal e navegue para dentro da pasta do projeto e em seguida backend:
   ```bash
   cd caminho/do/seu/projeto/backend
   ```
2. Crie o ambiente virtual (virtual environment - venv):
   ```bash
   python3 -m venv venv
   ```
3. Ative a venv recém-criada:
   ```bash
   source venv/bin/activate
   ```
   *(Ao ser ativada, normalmente a linha de comando exibirá o prefixo `(venv)` na frente do traço do terminal).*
4. Faça a instalação das dependências do sistema:
   ```bash
   pip install fastapi uvicorn
   ```

---

## 4. Passo a Passo: Frontend (Painel Web)

O frontend é construído com base no Node.js com empacotador Vite.

1. Abra outra guia/janela de terminal para deixar o processo separado do backend.
2. Acesse a pasta base frontend:
   ```bash
   cd caminho/do/seu/projeto/frontend
   ```
3. Instale todos os pacotes nativos do projeto através do Node Package Manager:
   ```bash
   npm install
   ```
4. Cumpra o requisito arquitetural de adicionar o plugin de certificados `vite-plugin-mkcert` em modo de desenvolvedor:
   ```bash
   npm install vite-plugin-mkcert -D
   ```
5. Rode o servidor de dev para começar a visualizar as páginas da aplicação:
   ```bash
   npm run dev
   ```

Tudo pronto! Seu projeto está disponível para desenvolvimento pelo Linux.

---

## 5. Soluções de Erros (Troubleshooting)

### Erro: Port 443 is already in use (Frontend)
Para acessar a aplicação no domínio web de forma limpa (`https://agrogemini.com` sem a porta :444 ao final), o Frontend está estritamente ajustado para rodar na porta segura `443` (`strictPort: true`).
Se o terminal Linux falhar no `npm run dev` indicando que a aba está ocupada, significa que outro serviço do sistema (como Apache, Nginx ou containers Docker) está em uso.

**Para liberar a porta no Ubuntu/Linux:**
1. Visualize os processos retendo a porta executando:
   ```bash
   sudo lsof -i :443
   ```
   *(Ou: `sudo netstat -nlpt | grep 443`)*
2. Encontre a coluna **PID** do processo culpado e mate-o forçadamente:
   ```bash
   sudo kill -9 <NUMERO_DO_PID_AQUI>
   ```
3. Reinicie o modo de dev do Frontend: `npm run dev`