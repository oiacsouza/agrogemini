# Casos de Teste — AgroGemini

## Suíte de Segurança e Hierarquia

### 1. Autenticação e Sessão
- [x] **TC-AUTH-01:** Login com credenciais válidas (Admin).
- [x] **TC-AUTH-02:** Login com credenciais válidas (Laboratório).
- [x] **TC-AUTH-03:** Bloqueio de login com senha incorreta.
- [x] **TC-AUTH-04:** Validação de expiração de token JWT.

### 2. Controle de Acesso (RBAC)
- [x] **TC-PERM-01:** Admin acessa lista global de laboratórios.
- [x] **TC-PERM-02:** Usuário de Laboratório (UP/UC) é bloqueado em rotas /admin.
- [x] **TC-PERM-03:** Produtor (UE) acessa apenas seus próprios laudos.

### 3. Hierarquia e Visibilidade (VPD Lógico)
- [x] **TC-HIER-01:** Laboratório Matriz visualiza amostras de todas as suas filiais.
- [x] **TC-HIER-02:** Laboratório Filial visualiza apenas suas amostras e de suas sub-filiais.
- [x] **TC-HIER-03:** Isolamento: Lab A não consegue acessar ID de Lab B (mesmo via URL).

### 4. Integridade de Dados
- [x] **TC-INT-01:** Impede criação de usuário com e-mail duplicado.
- [x] **TC-INT-02:** Validação de CNPJ (formato e unicidade).
- [x] **TC-INT-03:** Remoção em cascata (remover lab remove vínculos de usuários).

---
*Legenda: [x] Testado e Passou | [ ] Pendente | [!] Falhou*
