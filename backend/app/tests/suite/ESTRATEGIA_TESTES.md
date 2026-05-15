# Estratégia de Testes — AgroGemini

## 1. Visão Geral
Esta estratégia define a abordagem para garantir a qualidade, segurança e integridade do sistema AgroGemini, focando em autenticação, autorização (RBAC), isolamento de dados (hierarquia de laboratórios) e integridade do banco de dados Oracle.

## 2. Níveis de Teste
- **Testes de Unidade:** Validação de lógicas isoladas nos Repositórios e Serviços.
- **Testes de Integração:** Validação de endpoints da API e persistência no banco de dados.
- **Testes de Segurança (VPD Lógico):** Garantir que usuários visualizem apenas dados permitidos conforme sua posição na hierarquia.
- **Testes de Integridade:** Validação de constraints, unique keys e relacionamentos ORM.

## 3. Casos de Teste (Principais)
| ID | Descrição | Objetivo |
|:---|:---|:---|
| AUTH-01 | Autenticação Válida | Garantir que usuários legítimos consigam logar e recebam JWT. |
| PERM-01 | Acesso de Administrador | Validar que ADM acessa rotas globais. |
| PERM-02 | Restrição de Laboratório | Validar que Lab UC/UP não acessa rotas de Admin. |
| HIER-01 | Visibilidade de Filiais | Validar que Matriz vê dados de Filiais. |
| HIER-02 | Isolamento entre Árvores | Validar que Lab A não vê dados do Lab B. |
| INT-01 | Cadastro de Usuário Único | Validar restrição de e-mail duplicado. |

## 4. Ferramentas
- **Pytest:** Framework de execução.
- **HTTPX (Async):** Cliente para chamadas assíncronas à API.
- **SQLAlchemy:** Validação de estado do banco.
- **Coverage.py:** Evidência de cobertura.

## 5. Critérios de Aceitação
- 100% dos testes críticos de segurança passando.
- Cobertura de código nos serviços de acesso superior a 80%.
- Sem vazamento de dados entre laboratórios diferentes.
