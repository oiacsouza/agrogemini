-- AgroGemini Oracle v4 - separação por grupos lógicos
-- Arquivo: 09_extensoes_spatial.sql
-- Objetivo: Oracle Spatial e modelos comentados de particionamento futuro.

-- 3e. PREPARAÇÃO FUTURA

-- Geoespacial Oracle Spatial:
-- ALTER TABLE talhoes ADD (
--     geometria SDO_GEOMETRY
-- );
-- INSERT INTO USER_SDO_GEOM_METADATA(TABLE_NAME, COLUMN_NAME, DIMINFO, SRID)
-- VALUES (
--   'TALHOES',
--   'GEOMETRIA',
--   SDO_DIM_ARRAY(
--     SDO_DIM_ELEMENT('LONG', -180, 180, 0.0000001),
--     SDO_DIM_ELEMENT('LAT', -90, 90, 0.0000001)
--   ),
--   4326
-- );
-- CREATE INDEX IDX_TALHOES_GEOM ON talhoes(geometria) INDEXTYPE IS MDSYS.SPATIAL_INDEX_V2;

-- Particionamento futuro por mês:
-- CREATE TABLE amostras_part (...) PARTITION BY RANGE (data_entrada)
-- INTERVAL (NUMTOYMINTERVAL(1, 'MONTH'))
-- (PARTITION p0 VALUES LESS THAN (DATE '2026-01-01'));
-- CREATE TABLE laudos_part (...) PARTITION BY RANGE (data_emissao)
-- INTERVAL (NUMTOYMINTERVAL(1, 'MONTH'))
-- (PARTITION p0 VALUES LESS THAN (DATE '2026-01-01'));

-- BLOCO B - EXTENSÕES V3
--------------------------------------------------------------------------------

-- AgroGemini Oracle v3 - próximos passos
-- Extensões: espacial, particionamento, Oracle Text, auditoria, OML4Py e VPD/RLS

--------------------------------------------------------------------------------
-- 1) ESPACIAL: TALHOES.GEOM + METADATA + ÍNDICE ESPACIAL
--------------------------------------------------------------------------------
BEGIN
    EXECUTE IMMEDIATE q'[
        ALTER TABLE talhoes ADD (
            geom MDSYS.SDO_GEOMETRY
        )
    ]';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -902 THEN
            DBMS_OUTPUT.PUT_LINE('Oracle Spatial indisponivel; coluna TALHOES.GEOM nao foi criada.');
        ELSIF SQLCODE != -1430 THEN -- coluna já existe
            RAISE;
        END IF;
END;
/

DECLARE
    v_has_geom NUMBER := 0;
BEGIN
    SELECT COUNT(*)
      INTO v_has_geom
      FROM USER_TAB_COLS
     WHERE TABLE_NAME = 'TALHOES'
       AND COLUMN_NAME = 'GEOM';

    IF v_has_geom = 1 THEN
        BEGIN
            EXECUTE IMMEDIATE q'[
                DELETE FROM USER_SDO_GEOM_METADATA
                 WHERE TABLE_NAME = 'TALHOES'
                   AND COLUMN_NAME = 'GEOM'
            ]';

            EXECUTE IMMEDIATE q'[
                INSERT INTO USER_SDO_GEOM_METADATA (
                    TABLE_NAME,
                    COLUMN_NAME,
                    DIMINFO,
                    SRID
                ) VALUES (
                    'TALHOES',
                    'GEOM',
                    MDSYS.SDO_DIM_ARRAY(
                        MDSYS.SDO_DIM_ELEMENT('LONG', -180, 180, 0.0000001),
                        MDSYS.SDO_DIM_ELEMENT('LAT',  -90,  90, 0.0000001)
                    ),
                    4674
                )
            ]';
        EXCEPTION
            WHEN OTHERS THEN
                IF SQLCODE = -942 THEN
                    DBMS_OUTPUT.PUT_LINE('Oracle Spatial: USER_SDO_GEOM_METADATA indisponivel; metadata ignorado.');
                ELSE
                    DBMS_OUTPUT.PUT_LINE('Oracle Spatial: metadata ignorado. Motivo: ' || SQLERRM);
                END IF;
        END;
    ELSE
        DBMS_OUTPUT.PUT_LINE('Oracle Spatial: metadata de TALHOES.GEOM ignorado (coluna inexistente).');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Oracle Spatial: metadata ignorado. Motivo: ' || SQLERRM);
END;
/

DECLARE
    v_has_geom NUMBER := 0;
BEGIN
    SELECT COUNT(*)
      INTO v_has_geom
      FROM USER_TAB_COLS
     WHERE TABLE_NAME = 'TALHOES'
       AND COLUMN_NAME = 'GEOM';

    IF v_has_geom = 1 THEN
        BEGIN
            EXECUTE IMMEDIATE q'[
                CREATE INDEX IDX_TALHOES_GEOM
                ON talhoes(geom)
                INDEXTYPE IS MDSYS.SPATIAL_INDEX_V2
            ]';
        EXCEPTION
            WHEN OTHERS THEN
                IF SQLCODE != -955 THEN
                    DBMS_OUTPUT.PUT_LINE('Oracle Spatial: indice espacial ignorado. Motivo: ' || SQLERRM);
                END IF;
        END;
    ELSE
        DBMS_OUTPUT.PUT_LINE('Oracle Spatial: indice TALHOES.GEOM ignorado (coluna inexistente).');
    END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE q'[
        COMMENT ON COLUMN talhoes.geom IS 'Geometria espacial do talhão em SIRGAS 2000 (SRID 4674).'
    ]';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -904 THEN
            RAISE;
        END IF;
END;
/

--------------------------------------------------------------------------------
-- 2) PARTICIONAMENTO MENSAL - TABELAS DE ALTO VOLUME
-- Observação: Oracle não permite converter diretamente tabelas existentes comuns
-- para particionadas sem operação de redefinição/recriação. Abaixo segue modelo
-- de recriação particionada com INTERVAL MONTH.
--------------------------------------------------------------------------------

-- MODELO SUGERIDO PARA IMPORTACOES
-- PK/UK/FK/índices devem ser reaplicados conforme migration principal.
-- Para ambientes existentes, usar DBMS_REDEFINITION ou CTAS + rename.
--
-- CREATE TABLE importacoes_p (
--     ... mesmas colunas ...
-- )
-- PARTITION BY RANGE (criado_em)
-- INTERVAL (NUMTOYMINTERVAL(1, 'MONTH'))
-- (
--     PARTITION P_IMPORTACOES_2026_01 VALUES LESS THAN (TIMESTAMP '2026-02-01 00:00:00 UTC')
-- );

-- MODELO SUGERIDO PARA AMOSTRAS
-- CREATE TABLE amostras_p (
--     ... mesmas colunas ...
-- )
-- PARTITION BY RANGE (data_entrada)
-- INTERVAL (NUMTOYMINTERVAL(1, 'MONTH'))
-- (
--     PARTITION P_AMOSTRAS_2026_01 VALUES LESS THAN (DATE '2026-02-01')
-- );

-- MODELO SUGERIDO PARA LAUDOS
-- CREATE TABLE laudos_p (
--     ... mesmas colunas ...
-- )
-- PARTITION BY RANGE (data_emissao)
-- INTERVAL (NUMTOYMINTERVAL(1, 'MONTH'))
-- (
--     PARTITION P_LAUDOS_2026_01 VALUES LESS THAN (DATE '2026-02-01')
-- );

--------------------------------------------------------------------------------
