"""Allow lab client role in laboratorio_usuarios

Revision ID: 9f42b6f5b6a1
Revises: 166cdf55addb
Create Date: 2026-05-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "9f42b6f5b6a1"
down_revision: Union[str, Sequence[str], None] = "166cdf55addb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Use PL/SQL to safely drop any existing check constraint on 'papel'
    # This avoids ORA-02443 if the named constraint doesn't exist
    # and also cleans up system-named constraints that might conflict.
    op.execute("""
        DECLARE
          v_cond VARCHAR2(4000);
        BEGIN
          -- 1. Try to drop by name
          BEGIN
            EXECUTE IMMEDIATE 'ALTER TABLE laboratorio_usuarios DROP CONSTRAINT CK_LAB_USUARIOS_PAPEL';
          EXCEPTION
            WHEN OTHERS THEN
              IF SQLCODE != -2443 THEN RAISE; END IF;
          END;

          -- 2. Search and drop system check constraints on PAPEL column
          FOR r IN (
            SELECT c.constraint_name, c.search_condition
            FROM all_constraints c
            JOIN all_cons_columns cl ON c.constraint_name = cl.constraint_name
            WHERE c.table_name = 'LABORATORIO_USUARIOS'
              AND cl.column_name = 'PAPEL'
              AND c.constraint_type = 'C'
          ) LOOP
            v_cond := r.search_condition;
            IF (v_cond LIKE '%IN%' OR v_cond LIKE '%=%') AND r.constraint_name LIKE 'SYS_C%' THEN
              BEGIN
                EXECUTE IMMEDIATE 'ALTER TABLE laboratorio_usuarios DROP CONSTRAINT ' || r.constraint_name;
              EXCEPTION
                WHEN OTHERS THEN NULL;
              END;
            END IF;
          END LOOP;
        END;
    """)
    
    op.create_check_constraint(
        "CK_LAB_USUARIOS_PAPEL",
        "laboratorio_usuarios",
        "papel IN ('TECNICO','GESTOR','RESPONSAVEL_TECNICO','ADMINISTRADOR','CLIENTE')",
    )


def downgrade() -> None:
    op.execute("""
        BEGIN
            EXECUTE IMMEDIATE 'ALTER TABLE laboratorio_usuarios DROP CONSTRAINT CK_LAB_USUARIOS_PAPEL';
        EXCEPTION
            WHEN OTHERS THEN
                IF SQLCODE != -2443 THEN RAISE; END IF;
        END;
    """)
    op.create_check_constraint(
        "CK_LAB_USUARIOS_PAPEL",
        "laboratorio_usuarios",
        "papel IN ('TECNICO','GESTOR','RESPONSAVEL_TECNICO','ADMINISTRADOR')",
    )
