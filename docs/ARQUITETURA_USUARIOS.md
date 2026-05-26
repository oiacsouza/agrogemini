# Arquitetura de Usuários - AgroGemini

A arquitetura de usuários do AgroGemini foi desenhada sob um modelo de **Identidade Global com Multi-Tenancy Contextual (Múltiplos Inquilinos)**. O usuário é a fundação central de toda a plataforma. 

Abaixo estão os 5 pilares que sustentam o acesso e o isolamento de dados no sistema:

## 1. Identidade Global (Single Sign-On Interno)
* **Conceito:** O usuário tem apenas 1 conta no AgroGemini global. Se o João é "Cliente" do Laboratório A e depois vira "Cliente" do Laboratório B, ele não precisa de duas contas. A tabela `usuarios` é a fonte única da verdade (Single Source of Truth).
* **Fundação Universal:** É importante ressaltar que um **usuário é a base de tudo**. Portanto, ao criar um cliente, um funcionário ou uma filial, o sistema automaticamente **cria um usuário novo** (caso não exista) ou **vincula a um já existente** (se já houver o e-mail daquela pessoa cadastrado).
* **Vantagem:** Facilita o login unificado e o controle comercial (Planos) do sistema SaaS.
* **Obrigatoriedade de Plano:** Absolutamente todos os usuários possuem uma designação de plano (`plano_ativo`), sem exceções. Mesmo perfis que não pagam financeiramente (como um funcionário que apenas opera o sistema) receberão um plano de custo zero, como o `"FUNCIONARIO LAB"`, garantindo que todo acesso esteja atrelado a um pacote de limites e rastreamento.

## 2. Separação por Tipos Globais (`tipo_usuario`)
A arquitetura baseia-se em 4 grandes "camadas" que ditam a interface e o contexto que o usuário vai ver logo após logar:
* **`ADM` (Admin do Sistema):** Vê toda a operação do AgroGemini, faturamento global do SaaS, gerencia planos e todos os laboratórios. Não pertence a nenhum laboratório.
* **`UP` (Usuário Principal):** Dono ou gestor de um laboratório. É a entidade que "paga" a assinatura para o uso do laboratório.
* **`UC` (Usuário Colaborador):** Funcionário do laboratório (Técnico, Responsável Técnico, etc). Ele existe exclusivamente para trabalhar nas operações do laboratório.
* **`UE` (Usuário Externo):** Produtor/Fazendeiro. Ele é o cliente final da ponta e só consome amostras e laudos.

## 3. A Camada Multi-Tenancy (Isolamento de Dados)
A "mágica" arquitetural de isolamento (Multi-tenant) acontece na tabela de ponte chamada `laboratorio_usuarios`. Como um laboratório não pode ver os dados do outro, a arquitetura amarra o usuário ao contexto por meio dessa tabela:
* **Regra Rigorosa:** Um `UP`, `UC` ou `UE` precisa obrigatoriamente ter um registro na tabela `laboratorio_usuarios` para conseguir acessar e listar os dados daquele laboratório.
* **Papel Contextual (`papel`):** É nessa tabela que determinamos se o indivíduo é "ADMINISTRADOR", "TECNICO" ou "CLIENTE" em relação a um laboratório específico. Um usuário pode ser perfeitamente cliente do *Lab 1* e dono do *Lab 2* ao mesmo tempo, pois a arquitetura desvincula a **Pessoa** do seu **Papel na Empresa**.

## 4. A Camada de Domínio (Fazendas para Produtores)
Quando a arquitetura foca no produtor (`UE`), ela cria um segundo tipo de isolamento de domínio através da tabela de ponte `fazenda_usuarios`:
* O produtor é dono ou gestor da sua própria **Fazenda** e dos seus **Talhões**. O laboratório tem a função apenas de processar e enviar as Amostras/Laudos direcionados a esse Produtor. 
* Assim que o laudo cai no sistema, a arquitetura cruza o `cliente_id` da Amostra para garantir que apenas aquele Produtor tenha acesso à leitura daquele documento em seu portal privado.

## 5. Controle de Acesso Baseado em Atributos (RBAC e Granularidade)
Se o cargo geral (`tipo_usuario`) e o papel no laboratório (`papel`) não forem suficientes, a arquitetura permite permissões "cirúrgicas" via tabela `usuarios_permissoes`.
* **Escopo das Permissões:** Elas são aplicadas para as features específicas das operações do sistema.
* **Nota Financeira:** Não existe financeiro individual de um laboratório (contas a pagar/receber do lab). O módulo e a permissão financeira (`FINANCEIRO_VER`) pertencem exclusivamente à **Estrutura SaaS** (gerida pelo `ADM` do AgroGemini).

---

### Resumo Visual da Arquitetura

```text
[ IDENTIDADE GLOBAL (Tabela: usuarios) ] --- Autenticação (Login)
            |
            |--- [ PLANO E LIMITES (plano_ativo) ] ---> FREE, PREMIUM LAB, PREMIUM PROD, etc.
            |
            |--- [ CONTEXTO MULTI-LAB (laboratorio_usuarios) ] ---> Onde ele atua?
            |         |--- Lab A (Papel: ADMINISTRADOR)
            |         |--- Lab B (Papel: CLIENTE)
            |
            |--- [ CONTEXTO DE FAZENDAS (fazenda_usuarios) ] ---> O que ele é dono?
            |         |--- Fazenda Boa Vista (Papel: DONO)
            |
            |--- [ ACESSO GRANULAR (usuarios_permissoes) ] ---> Poderes extras?
                      |--- Ex: LAUDO_EDITAR = CONCEDIDA
```
