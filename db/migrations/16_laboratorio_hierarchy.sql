-- Adiciona estrutura hierárquica e vínculo principal com usuário base.

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE laboratorios ADD usuario_id NUMBER';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -1430 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE laboratorios ADD laboratorio_pai_id NUMBER';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -1430 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE q'~ALTER TABLE laboratorios ADD tipo_unidade VARCHAR2(10) DEFAULT 'MATRIZ' NOT NULL~';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -1430 THEN
            RAISE;
        END IF;
END;
/

UPDATE laboratorios l
   SET usuario_id = (
       SELECT MIN(lu.usuario_id)
         FROM laboratorio_usuarios lu
        WHERE lu.laboratorio_id = l.id
          AND lu.papel IN ('ADMINISTRADOR','GESTOR')
   )
 WHERE usuario_id IS NULL;

UPDATE laboratorios
   SET tipo_unidade = CASE WHEN laboratorio_pai_id IS NULL THEN 'MATRIZ' ELSE 'FILIAL' END
 WHERE tipo_unidade IS NULL;

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE laboratorios ADD CONSTRAINT FK_LABS_USUARIO_PRINCIPAL FOREIGN KEY (usuario_id) REFERENCES usuarios(id)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -2275 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE laboratorios ADD CONSTRAINT FK_LABS_LAB_PAI FOREIGN KEY (laboratorio_pai_id) REFERENCES laboratorios(id)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -2275 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE q'~ALTER TABLE laboratorios ADD CONSTRAINT CK_LABS_TIPO_UNIDADE CHECK (tipo_unidade IN ('MATRIZ','FILIAL'))~';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -2264 THEN
            RAISE;
        END IF;
END;
/

COMMENT ON COLUMN laboratorios.usuario_id IS 'Usuário principal/dono do laboratório.';
COMMENT ON COLUMN laboratorios.laboratorio_pai_id IS 'Laboratório pai imediato na hierarquia matriz/filial.';
COMMENT ON COLUMN laboratorios.tipo_unidade IS 'MATRIZ ou FILIAL.';
