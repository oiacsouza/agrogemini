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
    op.drop_constraint("CK_LAB_USUARIOS_PAPEL", "laboratorio_usuarios", type_="check")
    op.create_check_constraint(
        "CK_LAB_USUARIOS_PAPEL",
        "laboratorio_usuarios",
        "papel IN ('TECNICO','GESTOR','RESPONSAVEL_TECNICO','ADMINISTRADOR','CLIENTE')",
    )


def downgrade() -> None:
    op.drop_constraint("CK_LAB_USUARIOS_PAPEL", "laboratorio_usuarios", type_="check")
    op.create_check_constraint(
        "CK_LAB_USUARIOS_PAPEL",
        "laboratorio_usuarios",
        "papel IN ('TECNICO','GESTOR','RESPONSAVEL_TECNICO','ADMINISTRADOR')",
    )
