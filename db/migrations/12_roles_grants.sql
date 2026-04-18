-- AgroGemini Oracle v4 - separação por grupos lógicos
-- Arquivo: 12_roles_grants.sql
-- Objetivo: roles Oracle e grants por perfil.

BEGIN
    EXECUTE IMMEDIATE 'CREATE ROLE AGRO_ROLE_UE';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -1031 THEN
            DBMS_OUTPUT.PUT_LINE('Sem privilegio para CREATE ROLE; AGRO_ROLE_UE nao criada.');
        ELSIF SQLCODE != -1921 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE ROLE AGRO_ROLE_UP';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -1031 THEN
            DBMS_OUTPUT.PUT_LINE('Sem privilegio para CREATE ROLE; AGRO_ROLE_UP nao criada.');
        ELSIF SQLCODE != -1921 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE ROLE AGRO_ROLE_UC';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -1031 THEN
            DBMS_OUTPUT.PUT_LINE('Sem privilegio para CREATE ROLE; AGRO_ROLE_UC nao criada.');
        ELSIF SQLCODE != -1921 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE ROLE AGRO_ROLE_ADM';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -1031 THEN
            DBMS_OUTPUT.PUT_LINE('Sem privilegio para CREATE ROLE; AGRO_ROLE_ADM nao criada.');
        ELSIF SQLCODE != -1921 THEN
            RAISE;
        END IF;
END;
/

--------------------------------------------------------------------------------
-- 7) GRANTS INICIAIS POR PAPEL
--------------------------------------------------------------------------------
BEGIN
    EXECUTE IMMEDIATE 'GRANT SELECT ON planos_assinaturas TO AGRO_ROLE_UE, AGRO_ROLE_UP, AGRO_ROLE_UC, AGRO_ROLE_ADM';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE IN (-1031, -1919, -1917) THEN
            DBMS_OUTPUT.PUT_LINE('Grant ignorado em planos_assinaturas (roles ausentes ou sem privilegio).');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'GRANT SELECT ON fazendas TO AGRO_ROLE_UE, AGRO_ROLE_UP, AGRO_ROLE_UC';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE IN (-1031, -1919, -1917) THEN
            DBMS_OUTPUT.PUT_LINE('Grant ignorado em fazendas.');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'GRANT SELECT ON talhoes TO AGRO_ROLE_UE, AGRO_ROLE_UP, AGRO_ROLE_UC';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE IN (-1031, -1919, -1917) THEN
            DBMS_OUTPUT.PUT_LINE('Grant ignorado em talhoes.');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'GRANT SELECT, INSERT, UPDATE ON importacoes TO AGRO_ROLE_UP, AGRO_ROLE_UC';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE IN (-1031, -1919, -1917) THEN
            DBMS_OUTPUT.PUT_LINE('Grant ignorado em importacoes.');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'GRANT SELECT, INSERT, UPDATE ON amostras TO AGRO_ROLE_UP, AGRO_ROLE_UC';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE IN (-1031, -1919, -1917) THEN
            DBMS_OUTPUT.PUT_LINE('Grant ignorado em amostras (UP/UC).');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'GRANT SELECT ON amostras TO AGRO_ROLE_UE';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE IN (-1031, -1919, -1917) THEN
            DBMS_OUTPUT.PUT_LINE('Grant ignorado em amostras (UE).');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'GRANT SELECT, INSERT, UPDATE ON laudos TO AGRO_ROLE_UC';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE IN (-1031, -1919, -1917) THEN
            DBMS_OUTPUT.PUT_LINE('Grant ignorado em laudos (UC).');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'GRANT SELECT ON laudos TO AGRO_ROLE_UP, AGRO_ROLE_UE';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE IN (-1031, -1919, -1917) THEN
            DBMS_OUTPUT.PUT_LINE('Grant ignorado em laudos (UP/UE).');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'GRANT SELECT, INSERT, UPDATE ON laudo_resultados TO AGRO_ROLE_UP, AGRO_ROLE_UC';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE IN (-1031, -1919, -1917) THEN
            DBMS_OUTPUT.PUT_LINE('Grant ignorado em laudo_resultados.');
        ELSE
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'GRANT SELECT ON eventos_auditoria TO AGRO_ROLE_ADM, AGRO_ROLE_UC';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE IN (-1031, -1919, -1917) THEN
            DBMS_OUTPUT.PUT_LINE('Grant ignorado em eventos_auditoria.');
        ELSE
            RAISE;
        END IF;
END;
/

--------------------------------------------------------------------------------
-- 8) PREPARAÇÃO FUTURA
--------------------------------------------------------------------------------
-- 8.1) Criar camada de serviço para também auditar contexto de negócio:
--      motivo de aprovação, workflow, origem da integração, idempotency key.
--
-- 8.2) Expandir VPD para:
--      IMPORTACOES, LAUDO_RESULTADOS, ARQUIVOS, CONFIGURACOES_CALCULO,
--      LIMITES_REFERENCIA e EVENTOS_AUDITORIA.
--
-- 8.3) Integrar OML4Py com pipelines que:
--      - leem configuracoes_calculo e limites_referencia
--      - executam recomendação por cultura/bioma/método
--      - persistem score e classe interpretativa em laudo_resultados.
