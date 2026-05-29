"""
Testes unitários – app/services/fertilizer_report.py
Cobertura: build_fertilizer_report_payload
"""

import pytest
from unittest.mock import patch
from uuid import UUID

from app.services.fertilizer_report import build_fertilizer_report_payload
from app.schemas.fertilizer import (
    FertilizerReportPayloadRequest,
    FertilizerSamplePreview,
)


def _make_sample(**kwargs) -> FertilizerSamplePreview:
    defaults = dict(
        sample_id="S001",
        machine_sample_id="M001",
        sample_line="L001",
        calcium_ppm=50000.0,
        magnesium_ppm=10000.0,
        sulfur_ppm=5000.0,
        calcium_percent=5.0,
        magnesium_percent=1.0,
        sulfur_percent=0.5,
        elements_ppm={"CA": 50000.0, "MG": 10000.0, "S": 5000.0},
    )
    defaults.update(kwargs)
    return FertilizerSamplePreview(**defaults)


def _make_request(**kwargs) -> FertilizerReportPayloadRequest:
    defaults = dict(sample=_make_sample())
    defaults.update(kwargs)
    return FertilizerReportPayloadRequest(**defaults)


class TestBuildFertilizerReportPayload:
    def test_returns_payload_response(self):
        req = _make_request(request_number="REQ-001", report_number="REP-001")
        resp = build_fertilizer_report_payload(req)
        assert resp.request_number == "REQ-001"
        assert resp.report_number == "REP-001"
        assert resp.sample_number == "S001"

    def test_results_contain_three_items(self):
        req = _make_request()
        resp = build_fertilizer_report_payload(req)
        assert len(resp.results) == 3

    def test_calcium_result(self):
        req = _make_request()
        resp = build_fertilizer_report_payload(req)
        ca = next(r for r in resp.results if "Cálcio" in r.parameter)
        assert ca.result == 5.0
        assert ca.unit == "%"

    def test_magnesium_result(self):
        req = _make_request()
        resp = build_fertilizer_report_payload(req)
        mg = next(r for r in resp.results if "Magnésio" in r.parameter)
        assert mg.result == 1.0

    def test_sulfur_result(self):
        req = _make_request()
        resp = build_fertilizer_report_payload(req)
        s = next(r for r in resp.results if "Enxofre" in r.parameter)
        assert s.result == 0.5

    def test_none_results_when_no_measurements(self):
        sample = _make_sample(
            calcium_percent=None,
            magnesium_percent=None,
            sulfur_percent=None,
        )
        req = _make_request(sample=sample)
        resp = build_fertilizer_report_payload(req)
        for item in resp.results:
            assert item.result is None

    def test_default_technical_responsible_name(self):
        req = _make_request(technical_responsible_name=None)
        resp = build_fertilizer_report_payload(req)
        assert resp.technical_responsible_name == "Responsável Técnico"

    def test_custom_technical_responsible_name(self):
        req = _make_request(technical_responsible_name="Dr. João")
        resp = build_fertilizer_report_payload(req)
        assert resp.technical_responsible_name == "Dr. João"

    def test_default_auth_url(self):
        req = _make_request(auth_url=None)
        resp = build_fertilizer_report_payload(req)
        assert "autenticacao" in resp.auth_url

    def test_custom_auth_url(self):
        req = _make_request(auth_url="https://meu.site/auth")
        resp = build_fertilizer_report_payload(req)
        assert resp.auth_url == "https://meu.site/auth"

    def test_auth_code_generated_when_none(self):
        req = _make_request(auth_code=None)
        resp = build_fertilizer_report_payload(req)
        # deve ser um UUID válido em uppercase
        assert resp.auth_code is not None
        UUID(resp.auth_code)  # não lança se válido

    def test_auth_code_preserved_when_provided(self):
        req = _make_request(auth_code="CUSTOM-CODE-123")
        resp = build_fertilizer_report_payload(req)
        assert resp.auth_code == "CUSTOM-CODE-123"

    def test_description_fallback_to_sample_line(self):
        sample = _make_sample(sample_line="DESCRICAO-LINHA")
        req = _make_request(sample=sample, description=None)
        resp = build_fertilizer_report_payload(req)
        assert resp.description == "DESCRICAO-LINHA"

    def test_description_overrides_sample_line(self):
        sample = _make_sample(sample_line="DESCRICAO-LINHA")
        req = _make_request(sample=sample, description="Descrição Customizada")
        resp = build_fertilizer_report_payload(req)
        assert resp.description == "Descrição Customizada"

    def test_optional_fields_pass_through(self):
        req = _make_request(
            requester="Fazenda ABC",
            company_name="AgroTech LTDA",
            lot="LOT-001",
            ton="10T",
            city="Uberlândia",
        )
        resp = build_fertilizer_report_payload(req)
        assert resp.requester == "Fazenda ABC"
        assert resp.company_name == "AgroTech LTDA"
        assert resp.lot == "LOT-001"
        assert resp.ton == "10T"
        assert resp.city == "Uberlândia"
