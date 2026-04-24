-- 14. PLANO PRODUTOR
-- Adiciona campo plano_ativo na tabela usuarios para controle de plano (FREE/PREMIUM).
-- Usado principalmente para produtores. Para labs, o plano é derivado da tabela assinaturas.

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE usuarios ADD plano_ativo VARCHAR2(10) DEFAULT ''FREE''';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -1430 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE usuarios ADD CONSTRAINT CK_USUARIOS_PLANO CHECK (plano_ativo IN (''FREE'',''PREMIUM''))';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -2264 AND SQLCODE != -2261 THEN
            RAISE;
        END IF;
END;
/

-- Atualizar produtor premium existente
UPDATE usuarios SET plano_ativo = 'PREMIUM' WHERE email = 'produtor.premium@agrogemini.com';

-- Admin sempre premium
UPDATE usuarios SET plano_ativo = 'PREMIUM' WHERE tipo_usuario = 'ADM';

-- Lab premium (UP) — marcar como PREMIUM por conveniência (plano real vem de assinaturas)
UPDATE usuarios SET plano_ativo = 'PREMIUM' WHERE tipo_usuario = 'UP';

COMMIT;
