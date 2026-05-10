-- reapply_oracle_features.sql
-- Run this AFTER alembic upgrade head to restore Oracle-specific features

-- 1. Restore Audit Trigger for Laudos (Fixed syntax for 23ai)
CREATE OR REPLACE TRIGGER TR_AUD_LAUDOS
AFTER INSERT OR UPDATE OR DELETE ON laudos
FOR EACH ROW
DECLARE
    v_operacao VARCHAR2(10);
    v_ip_origem VARCHAR2(45);
    v_usuario_id NUMBER;
    v_laboratorio_id NUMBER;
BEGIN
    v_ip_origem := SYS_CONTEXT('AGRO_CTX', 'IP_ORIGEM');
    v_usuario_id := TO_NUMBER(SYS_CONTEXT('AGRO_CTX', 'USUARIO_ID'));
    v_laboratorio_id := TO_NUMBER(SYS_CONTEXT('AGRO_CTX', 'LABORATORIO_ID'));

    IF INSERTING THEN
        v_operacao := 'INSERT';
    ELSIF UPDATING THEN
        v_operacao := 'UPDATE';
    ELSE
        v_operacao := 'DELETE';
    END IF;

    IF INSERTING OR UPDATING THEN
        INSERT INTO eventos_auditoria (
            usuario_id, laboratorio_id, tabela_afetada, registro_id, operacao,
            dados_anteriores, dados_novos, ip_origem, criado_em
        ) VALUES (
            v_usuario_id, v_laboratorio_id, 'LAUDOS', :NEW.id, v_operacao,
            CASE WHEN UPDATING THEN
                JSON_OBJECT('id' : :OLD.id, 'status' : :OLD.status, 'numero_laudo' : :OLD.numero_laudo)
            ELSE NULL END,
            JSON_OBJECT('id' : :NEW.id, 'status' : :NEW.status, 'numero_laudo' : :NEW.numero_laudo),
            v_ip_origem, SYSTIMESTAMP
        );
    ELSE
        INSERT INTO eventos_auditoria (
            usuario_id, laboratorio_id, tabela_afetada, registro_id, operacao,
            dados_anteriores, dados_novos, ip_origem, criado_em
        ) VALUES (
            v_usuario_id, v_laboratorio_id, 'LAUDOS', :OLD.id, v_operacao,
            JSON_OBJECT('id' : :OLD.id, 'status' : :OLD.status, 'numero_laudo' : :OLD.numero_laudo),
            NULL, v_ip_origem, SYSTIMESTAMP
        );
    END IF;
END;
/

-- 2. Restore VPD Context
-- No need for CREATE ANY CONTEXT here if already granted, but we create the context
CREATE OR REPLACE CONTEXT AGRO_CTX USING AGRO_CTX_PKG;
/

CREATE OR REPLACE PACKAGE AGRO_CTX_PKG AS
    PROCEDURE SET_CONTEXT(p_usuario_id IN NUMBER, p_laboratorio_id IN NUMBER, p_tipo_usuario IN VARCHAR2, p_ip_origem IN VARCHAR2);
END AGRO_CTX_PKG;
/

CREATE OR REPLACE PACKAGE BODY AGRO_CTX_PKG AS
    PROCEDURE SET_CONTEXT(p_usuario_id IN NUMBER, p_laboratorio_id IN NUMBER, p_tipo_usuario IN VARCHAR2, p_ip_origem IN VARCHAR2) IS
    BEGIN
        DBMS_SESSION.SET_CONTEXT('AGRO_CTX', 'USUARIO_ID',     TO_CHAR(p_usuario_id));
        DBMS_SESSION.SET_CONTEXT('AGRO_CTX', 'LABORATORIO_ID', TO_CHAR(p_laboratorio_id));
        DBMS_SESSION.SET_CONTEXT('AGRO_CTX', 'TIPO_USUARIO',   p_tipo_usuario);
        DBMS_SESSION.SET_CONTEXT('AGRO_CTX', 'IP_ORIGEM',      p_ip_origem);
    END;
END AGRO_CTX_PKG;
/
