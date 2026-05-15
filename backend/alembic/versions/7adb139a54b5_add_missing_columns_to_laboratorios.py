"""Add missing columns to laboratorios

Revision ID: 7adb139a54b5
Revises: 9f42b6f5b6a1
Create Date: 2026-05-15 18:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7adb139a54b5'
down_revision: Union[str, Sequence[str], None] = '9f42b6f5b6a1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add missing columns to laboratorios
    op.add_column('laboratorios', sa.Column('usuario_id', sa.Integer(), nullable=True))
    op.add_column('laboratorios', sa.Column('laboratorio_pai_id', sa.Integer(), nullable=True))
    op.add_column('laboratorios', sa.Column('tipo_unidade', sa.String(length=10), server_default='MATRIZ', nullable=False))
    
    # Add foreign keys
    op.create_foreign_key('FK_LAB_USUARIO', 'laboratorios', 'usuarios', ['usuario_id'], ['id'])
    op.create_foreign_key('FK_LAB_PAI', 'laboratorios', 'laboratorios', ['laboratorio_pai_id'], ['id'])
    
    # Add check constraint for tipo_unidade
    op.create_check_constraint(
        'CK_LAB_TIPO_UNIDADE',
        'laboratorios',
        "tipo_unidade IN ('MATRIZ','FILIAL')"
    )


def downgrade() -> None:
    op.drop_constraint('CK_LAB_TIPO_UNIDADE', 'laboratorios', type_='check')
    op.drop_constraint('FK_LAB_PAI', 'laboratorios', type_='foreignkey')
    op.drop_constraint('FK_LAB_USUARIO', 'laboratorios', type_='foreignkey')
    op.drop_column('laboratorios', 'tipo_unidade')
    op.drop_column('laboratorios', 'laboratorio_pai_id')
    op.drop_column('laboratorios', 'usuario_id')
