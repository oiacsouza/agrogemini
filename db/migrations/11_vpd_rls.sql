-- AgroGemini Oracle v4 - separação por grupos lógicos
-- Arquivo: 11_vpd_rls.sql
-- Objetivo: contexto AGRO_CTX, extensões OML4Py e policies VPD/RLS.

--------------------------------------------------------------------------------
-- 4) AUDITORIA AUTOMÁTICA
--------------------------------------------------------------------------------

BEGIN
    EXECUTE IMMEDIATE q'[
        CREATE OR REPLACE CONTEXT AGRO_CTX USING AGRO_CTX_PKG
    ]';
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END;
/

--------------------------------------------------------------------------------
-- 5) EVOLUÇÃO PARA OML4Py / PIPELINES DE RECOMENDAÇÃO
--------------------------------------------------------------------------------
BEGIN
    EXECUTE IMMEDIATE q'[
        ALTER TABLE configuracoes_calculo ADD (
            tipo_execucao           VARCHAR2(30),
            modelo_nome             VARCHAR2(120),
            modelo_versao           VARCHAR2(60),
            feature_store_ref       VARCHAR2(240),
            score_confianca_min     NUMBER(5,2),
            parametros_modelo       CLOB
        )
    ]';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -1430 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE q'[
        ALTER TABLE configuracoes_calculo ADD CONSTRAINT CK_CONFIG_CALC_TIPO_EXEC
        CHECK (tipo_execucao IN ('FORMULA','MODELO_ML','PIPELINE_HIBRIDO'))
    ]';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -2261 AND SQLCODE != -2275 AND SQLCODE != -2264 THEN
            NULL;
        END IF;
END;
/

COMMENT ON COLUMN configuracoes_calculo.tipo_execucao IS 'Define se a configuração é fórmula determinística, modelo de ML ou pipeline híbrido.';
COMMENT ON COLUMN configuracoes_calculo.modelo_nome IS 'Nome lógico do modelo Oracle ML/OML4Py.';
COMMENT ON COLUMN configuracoes_calculo.modelo_versao IS 'Versão do artefato/modelo.';
COMMENT ON COLUMN configuracoes_calculo.feature_store_ref IS 'Referência lógica do conjunto de atributos de entrada.';
COMMENT ON COLUMN configuracoes_calculo.score_confianca_min IS 'Score mínimo para aceitar recomendação automática.';
COMMENT ON COLUMN configuracoes_calculo.parametros_modelo IS 'Parâmetros serializados do pipeline de recomendação.';

BEGIN
    EXECUTE IMMEDIATE q'[
        CREATE INDEX IDX_CONFIG_CALC_MODELO_NOME
        ON configuracoes_calculo(modelo_nome)
    ]';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/


--------------------------------------------------------------------------------
-- 6) VPD / RLS E ROLES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION FN_VPD_LABORATORIO (
    p_schema IN VARCHAR2,
    p_object IN VARCHAR2
) RETURN VARCHAR2
AS
    v_tipo_usuario   VARCHAR2(30) := SYS_CONTEXT('AGRO_CTX','TIPO_USUARIO');
    v_laboratorio_id VARCHAR2(50) := SYS_CONTEXT('AGRO_CTX','LABORATORIO_ID');
    v_usuario_id     VARCHAR2(50) := SYS_CONTEXT('AGRO_CTX','USUARIO_ID');
BEGIN
    IF v_tipo_usuario = 'ADM' THEN
        RETURN '1=1';
    ELSIF v_tipo_usuario IN ('UP','UC') THEN
        RETURN 'laboratorio_id = TO_NUMBER(SYS_CONTEXT(''AGRO_CTX'',''LABORATORIO_ID''))';
    ELSIF v_tipo_usuario = 'UE' THEN
        RETURN 'cliente_id = TO_NUMBER(SYS_CONTEXT(''AGRO_CTX'',''USUARIO_ID''))';
    ELSE
        RETURN '1=2';
    END IF;
END;
/

BEGIN
    DBMS_RLS.ADD_POLICY(
        object_schema   => USER,
        object_name     => 'AMOSTRAS',
        policy_name     => 'POL_AMOSTRAS_TENANT',
        function_schema => USER,
        policy_function => 'FN_VPD_LABORATORIO',
        statement_types => 'SELECT,INSERT,UPDATE,DELETE',
        update_check    => TRUE
    );
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -28104 THEN
            RAISE;
        END IF;
END;
/

CREATE OR REPLACE FUNCTION FN_VPD_LAUDOS (
    p_schema IN VARCHAR2,
    p_object IN VARCHAR2
) RETURN VARCHAR2
AS
    v_tipo_usuario VARCHAR2(30) := SYS_CONTEXT('AGRO_CTX','TIPO_USUARIO');
BEGIN
    IF v_tipo_usuario = 'ADM' THEN
        RETURN '1=1';
    ELSE
        RETURN 'laboratorio_id = TO_NUMBER(SYS_CONTEXT(''AGRO_CTX'',''LABORATORIO_ID''))';
    END IF;
END;
/

BEGIN
    DBMS_RLS.ADD_POLICY(
        object_schema   => USER,
        object_name     => 'LAUDOS',
        policy_name     => 'POL_LAUDOS_TENANT',
        function_schema => USER,
        policy_function => 'FN_VPD_LAUDOS',
        statement_types => 'SELECT,INSERT,UPDATE,DELETE',
        update_check    => TRUE
    );
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -28104 THEN
            RAISE;
        END IF;
END;
/
