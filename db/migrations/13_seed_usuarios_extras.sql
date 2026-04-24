-- 13. SEED USUÁRIOS EXTRAS
-- Seed criado para testes com 5 tipos de usuarios:
-- Senha para todos: Senha123!

INSERT INTO usuarios (id, nome, sobrenome, email, senha_hash, tipo_usuario, ativo) SELECT 6, 'Admin', 'Sistema', 'admin@agrogemini.com', '$2b$12$jr/SWZ9BPcMNtwNKOQUAruUnxSYdTuFCs.rezM/LOgwgaq/XtfGMq', 'ADM', 'Y' FROM dual WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE id = 6);
INSERT INTO usuarios (id, nome, sobrenome, email, senha_hash, tipo_usuario, ativo) SELECT 7, 'Lab', 'Premium', 'lab.premium@agrogemini.com', '$2b$12$jr/SWZ9BPcMNtwNKOQUAruUnxSYdTuFCs.rezM/LOgwgaq/XtfGMq', 'UP', 'Y' FROM dual WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE id = 7);
INSERT INTO usuarios (id, nome, sobrenome, email, senha_hash, tipo_usuario, ativo) SELECT 8, 'Lab', 'Gratis', 'lab.gratis@agrogemini.com', '$2b$12$jr/SWZ9BPcMNtwNKOQUAruUnxSYdTuFCs.rezM/LOgwgaq/XtfGMq', 'UC', 'Y' FROM dual WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE id = 8);
INSERT INTO usuarios (id, nome, sobrenome, email, senha_hash, tipo_usuario, ativo) SELECT 9, 'Produtor', 'Premium', 'produtor.premium@agrogemini.com', '$2b$12$jr/SWZ9BPcMNtwNKOQUAruUnxSYdTuFCs.rezM/LOgwgaq/XtfGMq', 'UE', 'Y' FROM dual WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE id = 9);
INSERT INTO usuarios (id, nome, sobrenome, email, senha_hash, tipo_usuario, ativo) SELECT 10, 'Produtor', 'Gratis', 'produtor.gratis@agrogemini.com', '$2b$12$jr/SWZ9BPcMNtwNKOQUAruUnxSYdTuFCs.rezM/LOgwgaq/XtfGMq', 'UE', 'Y' FROM dual WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE id = 10);
COMMIT;
