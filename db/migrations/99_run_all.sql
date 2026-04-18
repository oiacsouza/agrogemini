-- AgroGemini Oracle v4 - script mestre
-- Executa migrations em ordem de dependência.

WHENEVER SQLERROR EXIT SQL.SQLCODE;
SET DEFINE OFF;
SET SERVEROUTPUT ON;

PROMPT [01/13] Executando 00_drops.sql
@@00_drops.sql
PROMPT [02/13] Executando 01_tabelas_base.sql
@@01_tabelas_base.sql
PROMPT [03/13] Executando 02_tabelas_negocio.sql
@@02_tabelas_negocio.sql
PROMPT [04/13] Executando 03_tabelas_comercial.sql
@@03_tabelas_comercial.sql
PROMPT [05/13] Executando 04_tabelas_laboratorial.sql
@@04_tabelas_laboratorial.sql
PROMPT [06/13] Executando 05_auditoria.sql
@@05_auditoria.sql
PROMPT [07/13] Executando 06_indices.sql
@@06_indices.sql
PROMPT [08/13] Executando 07_sequences.sql
@@07_sequences.sql
PROMPT [09/13] Executando 08_seed.sql
@@08_seed.sql
PROMPT [10/13] Executando 09_extensoes_spatial.sql
@@09_extensoes_spatial.sql
PROMPT [11/13] Executando 10_extensoes_text.sql
@@10_extensoes_text.sql
PROMPT [12/13] Executando 11_vpd_rls.sql
@@11_vpd_rls.sql
PROMPT [13/13] Executando 12_roles_grants.sql
@@12_roles_grants.sql

PROMPT Migracao completa finalizada com sucesso.
