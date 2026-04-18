-- AgroGemini Oracle v4 - separação por grupos lógicos
-- Arquivo: 10_extensoes_text.sql
-- Objetivo: Oracle Text e package de contexto (AGRO_CTX_PKG).

-- Oracle Text:
-- CREATE INDEX IDX_LAUDOS_OBSERVACOES_CTX
-- ON laudos(observacoes)
-- INDEXTYPE IS CTXSYS.CONTEXT;

-- 3) ORACLE TEXT
--------------------------------------------------------------------------------
BEGIN
    EXECUTE IMMEDIATE q'[
        CREATE INDEX IDX_LAUDOS_OBSERVACOES_CTX
        ON laudos(observacoes)
        INDEXTYPE IS CTXSYS.CONTEXT
    ]';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -29833 THEN
            DBMS_OUTPUT.PUT_LINE('Oracle Text indisponivel; indice IDX_LAUDOS_OBSERVACOES_CTX ignorado.');
        ELSIF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE q'[
        CREATE INDEX IDX_IMPORTACOES_MSG_ERRO_CTX
        ON importacoes(mensagem_erro)
        INDEXTYPE IS CTXSYS.CONTEXT
    ]';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -29833 THEN
            DBMS_OUTPUT.PUT_LINE('Oracle Text indisponivel; indice IDX_IMPORTACOES_MSG_ERRO_CTX ignorado.');
        ELSIF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/

CREATE OR REPLACE PACKAGE AGRO_CTX_PKG AS
    PROCEDURE SET_CTX(
        p_usuario_id     IN NUMBER,
        p_laboratorio_id IN NUMBER,
        p_tipo_usuario   IN VARCHAR2,
        p_ip_origem      IN VARCHAR2
    );
END AGRO_CTX_PKG;
/

CREATE OR REPLACE PACKAGE BODY AGRO_CTX_PKG AS
    PROCEDURE SET_CTX(
        p_usuario_id     IN NUMBER,
        p_laboratorio_id IN NUMBER,
        p_tipo_usuario   IN VARCHAR2,
        p_ip_origem      IN VARCHAR2
    ) IS
    BEGIN
        DBMS_SESSION.SET_CONTEXT('AGRO_CTX', 'USUARIO_ID',     TO_CHAR(p_usuario_id));
        DBMS_SESSION.SET_CONTEXT('AGRO_CTX', 'LABORATORIO_ID', TO_CHAR(p_laboratorio_id));
        DBMS_SESSION.SET_CONTEXT('AGRO_CTX', 'TIPO_USUARIO',   p_tipo_usuario);
        DBMS_SESSION.SET_CONTEXT('AGRO_CTX', 'IP_ORIGEM',      p_ip_origem);
    END;
END AGRO_CTX_PKG;
/
