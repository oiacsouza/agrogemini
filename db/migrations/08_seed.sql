-- AgroGemini Oracle v4 - separação por grupos lógicos
-- Arquivo: 08_seed.sql
-- Objetivo: carga inicial de dados.

-- 4. SEED MÍNIMO

-- SEED: enderecos
INSERT INTO enderecos (id, cep, logradouro, numero, complemento, bairro, cidade, estado, latitude, longitude, pais) SELECT 1, '78000001', 'Rodovia MT 220', 'KM 12', 'Sede', 'Zona Rural', 'Sinop', 'MT', -11.8642000, -55.5024000, 'Brasil' FROM dual WHERE NOT EXISTS (SELECT 1 FROM enderecos WHERE id = 1);
INSERT INTO enderecos (id, cep, logradouro, numero, complemento, bairro, cidade, estado, latitude, longitude, pais) SELECT 2, '78890001', 'Avenida das Acacias', '500', 'Sala 2', 'Centro', 'Sorriso', 'MT', -12.5453000, -55.7210000, 'Brasil' FROM dual WHERE NOT EXISTS (SELECT 1 FROM enderecos WHERE id = 2);
INSERT INTO enderecos (id, cep, logradouro, numero, complemento, bairro, cidade, estado, latitude, longitude, pais) SELECT 3, '78049000', 'Rua das Mangueiras', '120', 'Casa', 'Jardim Europa', 'Cuiaba', 'MT', -15.6014000, -56.0979000, 'Brasil' FROM dual WHERE NOT EXISTS (SELECT 1 FROM enderecos WHERE id = 3);

-- SEED: usuarios
INSERT INTO usuarios (id, nome, sobrenome, email, senha_hash, tipo_usuario, endereco_id, ativo, criado_em, ultimo_acesso) SELECT 1, 'Alan', 'Silva', 'alan@fazendaboavista.com', '$2b$12$abcdefghijklmnopqrstuvABCDEFGHIJKLMNOpqrstuvwxyz12345', 'UE', 1, 'Y', SYSTIMESTAMP, SYSTIMESTAMP FROM dual WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE id = 1);
INSERT INTO usuarios (id, nome, sobrenome, email, senha_hash, tipo_usuario, endereco_id, ativo, criado_em, ultimo_acesso) SELECT 2, 'Renato', 'Alves Filho', 'renato@labagro.com.br', '$2b$12$mnopqrstuvwxyzABCDabcdefghijklmnopqrstuvEFGHIJKLMNO123', 'UP', 2, 'Y', SYSTIMESTAMP, SYSTIMESTAMP FROM dual WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE id = 2);
INSERT INTO usuarios (id, nome, sobrenome, email, senha_hash, tipo_usuario, endereco_id, ativo, criado_em, ultimo_acesso) SELECT 3, 'Juliana', 'Mota', 'juliana@labagro.com.br', '$2b$12$0123456789abcdefghijklmnopqrstuvABCDEFGHIJKLMNOpqrst', 'UP', 2, 'Y', SYSTIMESTAMP, SYSTIMESTAMP FROM dual WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE id = 3);
INSERT INTO usuarios (id, nome, sobrenome, email, senha_hash, tipo_usuario, endereco_id, ativo, criado_em, ultimo_acesso) SELECT 4, 'Marcos', 'Ferreira', 'marcos@labagro.com.br', '$2b$12$QRSTUVabcdefghijklmnop1234567890qrstuvwxyzABCDEFGHIJ', 'UC', 3, 'Y', SYSTIMESTAMP, SYSTIMESTAMP FROM dual WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE id = 4);
INSERT INTO usuarios (id, nome, sobrenome, email, senha_hash, tipo_usuario, endereco_id, ativo, criado_em, ultimo_acesso) SELECT 5, 'Patricia', 'Souza', 'patricia@labagro.com.br', '$2b$12$KLMNOPQRSTUVWXYZabcdef1234567890ghijklmnopqrstuvABCD', 'UC', 3, 'Y', SYSTIMESTAMP, SYSTIMESTAMP FROM dual WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE id = 5);

-- SEED: telefones_usuarios
INSERT INTO telefones_usuarios (id, usuario_id, numero, tipo, whatsapp) SELECT 1, 1, '66999990001', 'MOVEL', 'Y' FROM dual WHERE NOT EXISTS (SELECT 1 FROM telefones_usuarios WHERE id = 1);
INSERT INTO telefones_usuarios (id, usuario_id, numero, tipo, whatsapp) SELECT 2, 2, '66999990002', 'MOVEL', 'Y' FROM dual WHERE NOT EXISTS (SELECT 1 FROM telefones_usuarios WHERE id = 2);
INSERT INTO telefones_usuarios (id, usuario_id, numero, tipo, whatsapp) SELECT 3, 3, '66999990003', 'MOVEL', 'Y' FROM dual WHERE NOT EXISTS (SELECT 1 FROM telefones_usuarios WHERE id = 3);
INSERT INTO telefones_usuarios (id, usuario_id, numero, tipo, whatsapp) SELECT 4, 4, '65999990004', 'MOVEL', 'Y' FROM dual WHERE NOT EXISTS (SELECT 1 FROM telefones_usuarios WHERE id = 4);
INSERT INTO telefones_usuarios (id, usuario_id, numero, tipo, whatsapp) SELECT 5, 5, '65999990005', 'MOVEL', 'Y' FROM dual WHERE NOT EXISTS (SELECT 1 FROM telefones_usuarios WHERE id = 5);

-- SEED: fazendas
INSERT INTO fazendas (id, nome, cpf_cnpj, endereco_id, car, area_total_ha, criado_em) SELECT 1, 'Fazenda Boa Vista', '12345678901', 1, 'MT-5107945-ABC123', 1450.75, SYSTIMESTAMP FROM dual WHERE NOT EXISTS (SELECT 1 FROM fazendas WHERE id = 1);

-- SEED: fazenda_usuarios
INSERT INTO fazenda_usuarios (id, fazenda_id, usuario_id, papel, inicio_vigencia, fim_vigencia) SELECT 1, 1, 1, 'DONO', DATE '2026-01-01', NULL FROM dual WHERE NOT EXISTS (SELECT 1 FROM fazenda_usuarios WHERE id = 1);

-- SEED: talhoes
INSERT INTO talhoes (id, fazenda_id, identificacao, tipo_plantio, area, profundidade_amostragem_cm, textura_solo, bioma, latitude_centroide, longitude_centroide, criado_em) SELECT 1, 1, 'TALHAO-01', 'DIRETO', 320.50, 20.00, 'ARGILOSA', 'CERRADO', -11.8645000, -55.5030000, SYSTIMESTAMP FROM dual WHERE NOT EXISTS (SELECT 1 FROM talhoes WHERE id = 1);
INSERT INTO talhoes (id, fazenda_id, identificacao, tipo_plantio, area, profundidade_amostragem_cm, textura_solo, bioma, latitude_centroide, longitude_centroide, criado_em) SELECT 2, 1, 'TALHAO-02', 'DIRETO', 280.00, 20.00, 'MEDIA', 'CERRADO', -11.8652000, -55.5041000, SYSTIMESTAMP FROM dual WHERE NOT EXISTS (SELECT 1 FROM talhoes WHERE id = 2);

-- SEED: laboratorios
INSERT INTO laboratorios (id, nome, cnpj, endereco_id, email, ativo, acreditacao_iso17025, registro_renasem, credenciamento_mapa, criado_em) SELECT 1, 'Laboratorio AgroGemini', '12345678000199', 2, 'contato@labagro.com.br', 'Y', 'Y', 'RENASEM-00991', 'MAPA-MT-00478', SYSTIMESTAMP FROM dual WHERE NOT EXISTS (SELECT 1 FROM laboratorios WHERE id = 1);

-- SEED: laboratorio_usuarios
INSERT INTO laboratorio_usuarios (id, laboratorio_id, usuario_id, papel, registro_crea) SELECT 1, 1, 2, 'TECNICO', 'CREA-MT-1001' FROM dual WHERE NOT EXISTS (SELECT 1 FROM laboratorio_usuarios WHERE id = 1);
INSERT INTO laboratorio_usuarios (id, laboratorio_id, usuario_id, papel, registro_crea) SELECT 2, 1, 3, 'TECNICO', 'CREA-MT-1002' FROM dual WHERE NOT EXISTS (SELECT 1 FROM laboratorio_usuarios WHERE id = 2);
INSERT INTO laboratorio_usuarios (id, laboratorio_id, usuario_id, papel, registro_crea) SELECT 3, 1, 4, 'GESTOR', 'CREA-MT-2001' FROM dual WHERE NOT EXISTS (SELECT 1 FROM laboratorio_usuarios WHERE id = 3);
INSERT INTO laboratorio_usuarios (id, laboratorio_id, usuario_id, papel, registro_crea) SELECT 4, 1, 5, 'GESTOR', 'CREA-MT-2002' FROM dual WHERE NOT EXISTS (SELECT 1 FROM laboratorio_usuarios WHERE id = 4);

-- SEED: telefones_laboratorios
INSERT INTO telefones_laboratorios (id, laboratorio_id, numero, tipo) SELECT 1, 1, '6635432100', 'COMERCIAL' FROM dual WHERE NOT EXISTS (SELECT 1 FROM telefones_laboratorios WHERE id = 1);

-- SEED: planos_assinaturas
INSERT INTO planos_assinaturas (id, tipo, valor, descricao, limite_amostras, limite_usuarios, permite_api, ativo) SELECT 1, 'BASICO', 499.90, 'Plano basico com limite operacional reduzido.', 200, 5, 'N', 'Y' FROM dual WHERE NOT EXISTS (SELECT 1 FROM planos_assinaturas WHERE id = 1);
INSERT INTO planos_assinaturas (id, tipo, valor, descricao, limite_amostras, limite_usuarios, permite_api, ativo) SELECT 2, 'PREMIUM', 1299.90, 'Plano premium com maior volume e acesso a API.', 5000, 50, 'Y', 'Y' FROM dual WHERE NOT EXISTS (SELECT 1 FROM planos_assinaturas WHERE id = 2);

-- SEED: assinaturas
INSERT INTO assinaturas (id, laboratorio_id, plano_id, numero_contrato, arquivo_contrato, data_inicio, data_expiracao, status, renovacao_automatica, amostras_consumidas) SELECT 1, 1, 2, 'CTR-AG-2026-0001', '/contratos/ctr-ag-2026-0001.pdf', DATE '2026-01-01', DATE '2026-12-31', 'ATIVA', 'Y', 2 FROM dual WHERE NOT EXISTS (SELECT 1 FROM assinaturas WHERE id = 1);

-- SEED: importacoes
INSERT INTO importacoes (id, laboratorio_id, usuario_id, nome_arquivo, tipo_arquivo, formato_instrumento, caminho_arquivo, hash_arquivo, status, mensagem_erro, total_registros, registros_processados, criado_em, processado_em) SELECT 1, 1, 2, 'solo_abril_2026.xlsx', 'XLSX', 'EQUIPAMENTO_X', '/importacoes/solo_abril_2026.xlsx', 'aabbccddeeff00112233445566778899', 'PROCESSADO', NULL, 2, 2, SYSTIMESTAMP, SYSTIMESTAMP FROM dual WHERE NOT EXISTS (SELECT 1 FROM importacoes WHERE id = 1);

-- SEED: amostras
INSERT INTO amostras (id, talhao_id, cliente_id, laboratorio_id, importacao_id, codigo_interno, codigo_barras, tipo_amostra, descricao, lote, tonelada, metodo_extracao, data_coleta, data_entrada, data_saida, status, prioridade, criado_em) SELECT 1, 1, 1, 1, 1, 'AMO-2026-0001', '789000000001', 'SOLO', 'Amostra composta do talhao 01.', NULL, NULL, 'MEHLICH-1', DATE '2026-04-01', DATE '2026-04-02', DATE '2026-04-07', 'LAUDO_GERADO', 'ALTA', SYSTIMESTAMP FROM dual WHERE NOT EXISTS (SELECT 1 FROM amostras WHERE id = 1);
INSERT INTO amostras (id, talhao_id, cliente_id, laboratorio_id, importacao_id, codigo_interno, codigo_barras, tipo_amostra, descricao, lote, tonelada, metodo_extracao, data_coleta, data_entrada, data_saida, status, prioridade, criado_em) SELECT 2, 2, 1, 1, 1, 'AMO-2026-0002', '789000000002', 'SOLO', 'Amostra composta do talhao 02.', NULL, NULL, 'MEHLICH-1', DATE '2026-04-01', DATE '2026-04-02', NULL, 'EM_ANALISE', 'MEDIA', SYSTIMESTAMP FROM dual WHERE NOT EXISTS (SELECT 1 FROM amostras WHERE id = 2);

-- SEED: configuracoes_calculo
INSERT INTO configuracoes_calculo (id, laboratorio_id, tipo_laudo, descricao, elemento, formula_matematica, unidade_resultado, ativo, versao, ordem_execucao, substituido_por, valido_de, valido_ate) SELECT 1, 1, 'SOLO', 'Calculo de classificacao para fosforo disponivel.', 'P', '(P_DISPONIVEL / 10)', 'mg/dm3', 'Y', 1.00, 1, NULL, DATE '2026-01-01', NULL FROM dual WHERE NOT EXISTS (SELECT 1 FROM configuracoes_calculo WHERE id = 1);

-- SEED: laudos
INSERT INTO laudos (id, amostra_id, laboratorio_id, responsavel_id, tipo_laudo, numero_pedido, numero_laudo, solicitante_nome, razao_social, propriedade, cidade, data_entrada, data_saida, data_emissao, status, pdf_path, hash_autenticacao, observacoes, responsavel_tecnico_nome, responsavel_tecnico_registro, credenciamento_mapa, criado_em) SELECT 1, 1, 1, 4, 'SOLO', 'PED-2026-0001', 'LAU-2026-0001', 'Alan Silva', 'Fazenda Boa Vista', 'Fazenda Boa Vista', 'Sinop', DATE '2026-04-02', DATE '2026-04-07', DATE '2026-04-08', 'EMITIDO', '/laudos/LAU-2026-0001.pdf', 'HASH-LAUDO-0001', 'Laudo emitido apos revisao tecnica.', 'Marcos Ferreira', 'CREA-MT-2001', 'MAPA-MT-00478', SYSTIMESTAMP FROM dual WHERE NOT EXISTS (SELECT 1 FROM laudos WHERE id = 1);

-- SEED: laudo_resultados
INSERT INTO laudo_resultados (id, laudo_id, configuracao_id, parametro, unidade, garantia, resultado, resultado_convertido, unidade_convertida, classe_interpretativa, ordem_exibicao, fora_spec) SELECT 1, 1, NULL, 'pH', 'CaCl2', NULL, 5.400000, 5.400000, 'CaCl2', 'MEDIO', 1, 'N' FROM dual WHERE NOT EXISTS (SELECT 1 FROM laudo_resultados WHERE id = 1);
INSERT INTO laudo_resultados (id, laudo_id, configuracao_id, parametro, unidade, garantia, resultado, resultado_convertido, unidade_convertida, classe_interpretativa, ordem_exibicao, fora_spec) SELECT 2, 1, 1, 'P', 'mg/dm3', NULL, 8.200000, 8.200000, 'mg/dm3', 'BAIXO', 2, 'N' FROM dual WHERE NOT EXISTS (SELECT 1 FROM laudo_resultados WHERE id = 2);
INSERT INTO laudo_resultados (id, laudo_id, configuracao_id, parametro, unidade, garantia, resultado, resultado_convertido, unidade_convertida, classe_interpretativa, ordem_exibicao, fora_spec) SELECT 3, 1, NULL, 'K', 'cmolc/dm3', NULL, 0.180000, 0.180000, 'cmolc/dm3', 'ADEQUADO', 3, 'N' FROM dual WHERE NOT EXISTS (SELECT 1 FROM laudo_resultados WHERE id = 3);

-- SEED: variaveis_calculo
INSERT INTO variaveis_calculo (id, configuracao_id, nome_variavel, origem_variavel, parametro_ref, constante_valor, descricao) SELECT 1, 1, 'P_DISPONIVEL', 'RESULTADO', 'P', NULL, 'Valor de fosforo disponivel no resultado analitico.' FROM dual WHERE NOT EXISTS (SELECT 1 FROM variaveis_calculo WHERE id = 1);
INSERT INTO variaveis_calculo (id, configuracao_id, nome_variavel, origem_variavel, parametro_ref, constante_valor, descricao) SELECT 2, 1, 'FATOR_AJUSTE', 'CONSTANTE', NULL, 10, 'Fator divisor de classificacao.' FROM dual WHERE NOT EXISTS (SELECT 1 FROM variaveis_calculo WHERE id = 2);

COMMIT;


