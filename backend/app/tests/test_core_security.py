"""
Testes unitários – app/core/security.py
Cobertura: hash_password, verify_password, create_access_token, decode_token
"""

import pytest
from datetime import timedelta

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
)


class TestHashPassword:
    def test_returns_string(self):
        result = hash_password("Senha123!")
        assert isinstance(result, str)

    def test_hash_not_equal_to_plain(self):
        plain = "Senha123!"
        assert hash_password(plain) != plain

    def test_different_calls_produce_different_hashes(self):
        """bcrypt usa salt aleatório; cada chamada produz hash diferente."""
        h1 = hash_password("Senha123!")
        h2 = hash_password("Senha123!")
        assert h1 != h2

    def test_empty_string_hashes(self):
        result = hash_password("")
        assert isinstance(result, str) and len(result) > 0


class TestVerifyPassword:
    def test_correct_password_returns_true(self):
        plain = "Senha123!"
        hashed = hash_password(plain)
        assert verify_password(plain, hashed) is True

    def test_wrong_password_returns_false(self):
        hashed = hash_password("Senha123!")
        assert verify_password("SenhaErrada", hashed) is False

    def test_invalid_hash_returns_false(self):
        """ValueError interno deve ser capturado e retornar False."""
        assert verify_password("qualquer", "hash_invalido") is False

    def test_empty_password_against_hash(self):
        hashed = hash_password("Senha123!")
        assert verify_password("", hashed) is False


class TestCreateAccessToken:
    def test_returns_string(self):
        token = create_access_token({"sub": "42"})
        assert isinstance(token, str) and len(token) > 0

    def test_token_has_three_parts(self):
        """JWT possui três partes separadas por ponto."""
        token = create_access_token({"sub": "1"})
        assert len(token.split(".")) == 3

    def test_custom_expires_delta(self):
        token = create_access_token({"sub": "1"}, expires_delta=timedelta(minutes=1))
        assert token is not None

    def test_different_data_produces_different_tokens(self):
        t1 = create_access_token({"sub": "1"})
        t2 = create_access_token({"sub": "2"})
        assert t1 != t2


class TestDecodeToken:
    def test_valid_token_returns_payload(self):
        token = create_access_token({"sub": "99"})
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "99"

    def test_invalid_token_returns_none(self):
        assert decode_token("token.invalido.aqui") is None

    def test_empty_string_returns_none(self):
        assert decode_token("") is None

    def test_garbage_string_returns_none(self):
        assert decode_token("lixo_total") is None

    def test_round_trip_data_integrity(self):
        data = {"sub": "7", "role": "ADM", "extra": 123}
        token = create_access_token(data)
        payload = decode_token(token)
        assert payload["sub"] == "7"
        assert payload["role"] == "ADM"
        assert payload["extra"] == 123
