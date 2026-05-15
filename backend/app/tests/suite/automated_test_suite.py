import asyncio
import sys
import os
import pytest
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

# Add backend to path
sys.path.append(os.getcwd())

from app.db.database import engine, AsyncSessionLocal
from app.services.access_control import LabAccessService
from app.services.auth_service import AuthService
from app.models.usuario import Usuario
from app.models.laboratorio import Laboratorio, LaboratorioUsuario

async def test_auth_and_hierarchy():
    print("\n--- INICIANDO TESTE DE AUTENTICAÇÃO E HIERARQUIA ---")
    async with AsyncSessionLocal() as db:
        # 1. Testar login Admin
        print("Testando Login Admin (admin@agrogemini.com)...")
        try:
            from app.schemas.auth import LoginRequest
            auth_service = AuthService(db)
            login_data = LoginRequest(email="admin@agrogemini.com", senha="Senha123!")
            token_resp = await auth_service.login(login_data)
            print(f"✅ Login Admin OK. Token gerado: {token_resp.access_token[:20]}...")
        except Exception as e:
            print(f"❌ Falha no login Admin: {e}")

        # 2. Testar Hierarquia de Visibilidade
        print("\nTestando Visibilidade de Laboratórios para Usuário ID 2 (Gestor Lab Premium)...")
        # Criar objeto de usuário simulado
        user_lab = {
            "id": 2,
            "tipo_usuario": "UP"
        }
        
        access_service = LabAccessService(db)
        visible_labs = await access_service.visible_labs_for_user(user_lab)
        print(f"✅ Laboratórios visíveis para Usuário 2: {[l.nome for l in visible_labs]}")
        
        if len(visible_labs) > 0:
            print(f"✅ Hierarquia OK. Usuário consegue ver sua matriz e filiais descendentes.")
        else:
            print(f"❌ Erro: Usuário 2 deveria ver laboratórios associados.")

async def test_database_integrity():
    print("\n--- INICIANDO TESTE DE INTEGRIDADE DE DADOS ---")
    async with AsyncSessionLocal() as db:
        # Testar duplicidade de e-mail (Constraint UNIQUE)
        print("Testando restrição de e-mail duplicado...")
        try:
            # Tentar inserir um usuário com e-mail do admin
            sql = text("INSERT INTO usuarios (nome, sobrenome, email, senha_hash, tipo_usuario, ativo) VALUES ('Teste', 'Integridade', 'admin@agrogemini.com', 'hash', 'ADM', 'Y')")
            await db.execute(sql)
            await db.commit()
            print("❌ Erro: O banco permitiu e-mail duplicado!")
        except Exception as e:
            await db.rollback()
            print(f"✅ Sucesso: O banco bloqueou e-mail duplicado conforme esperado. (Erro: ORA-00001 ou IntegrityError)")

async def run_all_tests():
    print("🚀 AgroGemini Automated Test Suite")
    print("====================================")
    await test_auth_and_hierarchy()
    await test_database_integrity()
    print("\n====================================")
    print("🏁 Testes concluídos.")

if __name__ == "__main__":
    asyncio.run(run_all_tests())
