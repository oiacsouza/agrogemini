# AgroGemini Frontend

Este é o diretório raiz do Frontend da plataforma web de Gestão Agronômica **AgroGemini**. A aplicação é construída com foco em alta responsividade (Mobile-First) e extensibilidade global.

## 🚀 Tecnologias Utilizadas

- **[React](https://react.dev/)** + **[Vite](https://vitejs.dev/)**: Framework visual e Build-Tool de altíssima performance.
- **[Framer Motion](https://www.framer.com/motion/)**: Utilizado para animações robustas de intersecção (scroll) e interatividade suave.
- **[Lucide React](https://lucide.dev/)**: Biblioteca de ícones modernos em conjunto com o design nativo da aplicação.
- **CSS Puro (Variáveis)**: Seguindo uma estrutura modularizada no arquivo base `index.css`, abstendo bibliotecas pesadas e optando por flex/grid robustos.

## 🌍 Arquitetura Multilíngue (i18n)

A Landing Page principal possui um motor de tradução embutido via state hook. 
O gerenciamento dos idiomas (Português, Inglês e Espanhol) concentra-se dentro de:
`src/locales.js`

Para adicionar um novo idioma ou editar um texto, **modifique o objeto `translations` naquele diretório**. O Frontend refletirá magicamente a alteração usando a aba com o ícone do globo.

## 📦 Como rodar este projeto

1. Tenha o [Node.js](https://nodejs.org/) instalado.
2. Certifique-se de estar dentro desta pasta `/frontend`.
3. Instale os repositórios vitais:
   ```bash
   npm install
   ```
4. Suba o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

O site será executado imediatamente. Devido à presença de ferramentas do host (como o plugin `mkcert` injetado via roteamento web para domínios), consulte o README raiz na pasta mãe para configurações avançadas de hosts.
