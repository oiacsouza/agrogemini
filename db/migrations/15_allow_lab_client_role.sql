-- Permite vincular produtores como clientes de laboratórios.
-- Necessário para bancos criados antes do papel CLIENTE existir na constraint.

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE laboratorio_usuarios DROP CONSTRAINT CK_LAB_USUARIOS_PAPEL';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -2443 THEN
            RAISE;
        END IF;
END;
/

ALTER TABLE laboratorio_usuarios ADD CONSTRAINT CK_LAB_USUARIOS_PAPEL
    CHECK (papel IN ('TECNICO','GESTOR','RESPONSAVEL_TECNICO','ADMINISTRADOR','CLIENTE'));

COMMENT ON COLUMN laboratorio_usuarios.papel IS 'TECNICO, GESTOR, RESPONSAVEL_TECNICO, ADMINISTRADOR ou CLIENTE.';
