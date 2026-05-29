"""
Testes unitários – app/core/validators.py
Cobertura: validate_cpf, validate_cnpj, validate_cpf_cnpj
"""

import pytest

from app.core.validators import validate_cpf, validate_cnpj, validate_cpf_cnpj


class TestValidateCPF:
    # CPFs válidos reais (gerados matematicamente)
    VALID_CPFS = [
        "529.982.247-25",  # com máscara
        "52998224725",     # sem máscara
        "111.444.777-35",
        "11144477735",
    ]

    # CPFs inválidos
    INVALID_CPFS = [
        "000.000.000-00",  # todos zeros
        "111.111.111-11",  # todos iguais
        "11111111111",     # todos iguais sem máscara
        "123.456.789-00",  # dígitos verificadores errados
        "12345678",        # muito curto
        "123456789012",    # muito longo
        "",
    ]

    @pytest.mark.parametrize("cpf", VALID_CPFS)
    def test_valid_cpf(self, cpf):
        assert validate_cpf(cpf) is True

    @pytest.mark.parametrize("cpf", INVALID_CPFS)
    def test_invalid_cpf(self, cpf):
        assert validate_cpf(cpf) is False


class TestValidateCNPJ:
    # CNPJs válidos
    VALID_CNPJS = [
        "11.222.333/0001-81",  # com máscara
        "11222333000181",      # sem máscara
        "45.997.418/0001-53",
        "45997418000153",
    ]

    # CNPJs inválidos
    INVALID_CNPJS = [
        "00.000.000/0000-00",  # todos zeros
        "11.111.111/1111-11",  # todos iguais
        "11111111111111",      # todos iguais sem máscara
        "11.222.333/0001-00",  # dígitos verificadores errados
        "1234567",             # muito curto
        "123456789012345",     # muito longo
        "",
    ]

    @pytest.mark.parametrize("cnpj", VALID_CNPJS)
    def test_valid_cnpj(self, cnpj):
        assert validate_cnpj(cnpj) is True

    @pytest.mark.parametrize("cnpj", INVALID_CNPJS)
    def test_invalid_cnpj(self, cnpj):
        assert validate_cnpj(cnpj) is False


class TestValidateCpfCnpj:
    def test_valid_cpf_dispatched_correctly(self):
        assert validate_cpf_cnpj("529.982.247-25") is True

    def test_valid_cnpj_dispatched_correctly(self):
        assert validate_cpf_cnpj("11.222.333/0001-81") is True

    def test_invalid_cpf_dispatched_correctly(self):
        assert validate_cpf_cnpj("111.111.111-11") is False

    def test_invalid_cnpj_dispatched_correctly(self):
        assert validate_cpf_cnpj("11.111.111/1111-11") is False

    def test_wrong_length_returns_false(self):
        # 10 dígitos – não é CPF nem CNPJ
        assert validate_cpf_cnpj("1234567890") is False

    def test_empty_returns_false(self):
        assert validate_cpf_cnpj("") is False

    def test_letters_only_returns_false(self):
        assert validate_cpf_cnpj("abc.def.ghi-jk") is False
