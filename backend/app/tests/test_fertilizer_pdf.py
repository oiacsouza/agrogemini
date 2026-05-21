"""
Testes – app/services/fertilizer_pdf.py
Cobre: render_fertilizer_report_pdf, helpers _fit, _format_decimal,
_draw_section_title, _draw_two_columns, _draw_results_table
"""
import pytest
from unittest.mock import MagicMock, patch

from app.services.fertilizer_pdf import (
    render_fertilizer_report_pdf,
    _fit,
    _format_decimal,
    _draw_section_title,
    _draw_two_columns,
    _draw_results_table,
)
from app.schemas.fertilizer import FertilizerReportPayloadResponse, FertilizerReportResultItem


def _make_report(**kwargs):
    defaults = dict(
        sample_number="S001",
        request_number="REQ-01",
        report_number="REP-01",
        requester="Fazenda ABC",
        company_name="Agro LTDA",
        received_at="01/01/2026",
        released_at="05/01/2026",
        property_name="Fazenda Central",
        city="Sinop/MT",
        lot="L001",
        ton="10T",
        description="Calcário",
        reference="REF-001",
        collected_at="30/12/2025",
        manufactured_at="15/12/2025",
        expires_at="15/12/2027",
        technical_responsible_name="Dr. João",
        technical_responsible_role="Químico",
        technical_responsible_registration="CRQ-12345",
        mapa_credential="MAPA-999",
        auth_code="AUTH-ABC",
        auth_url="https://sistema.test/auth",
        results=[
            FertilizerReportResultItem(parameter="Cálcio", unit="%", result=5.0),
            FertilizerReportResultItem(parameter="Magnésio", unit="%", result=1.0),
            FertilizerReportResultItem(parameter="Enxofre", unit="%", result=0.5),
        ],
    )
    defaults.update(kwargs)
    return FertilizerReportPayloadResponse(**defaults)


class TestFit:
    def test_short_string_unchanged(self):
        assert _fit("abc", 10) == "abc"

    def test_none_returns_empty(self):
        assert _fit(None, 10) == ""

    def test_long_string_truncated(self):
        result = _fit("A" * 20, 10)
        assert len(result) == 10
        assert result.endswith("...")

    def test_exact_length_unchanged(self):
        assert _fit("hello", 5) == "hello"


class TestFormatDecimal:
    def test_none_returns_empty(self):
        assert _format_decimal(None) == ""

    def test_value_formatted(self):
        assert _format_decimal(5.0) == "5,00"

    def test_decimal_uses_comma(self):
        result = _format_decimal(1.23)
        assert "," in result
        assert "." not in result


class TestRenderFertilizerReportPdf:
    def test_returns_bytes(self):
        report = _make_report()
        result = render_fertilizer_report_pdf(report)
        assert isinstance(result, bytes)
        assert len(result) > 100  # PDF não vazio

    def test_pdf_has_pdf_header(self):
        report = _make_report()
        result = render_fertilizer_report_pdf(report)
        assert result[:4] == b"%PDF"

    def test_no_city_uses_default(self):
        report = _make_report(city=None)
        result = render_fertilizer_report_pdf(report)
        assert isinstance(result, bytes)

    def test_no_technical_name_uses_default(self):
        report = _make_report(technical_responsible_name=None)
        result = render_fertilizer_report_pdf(report)
        assert isinstance(result, bytes)

    def test_no_technical_role_uses_default(self):
        report = _make_report(technical_responsible_role=None)
        result = render_fertilizer_report_pdf(report)
        assert isinstance(result, bytes)

    def test_empty_results(self):
        report = _make_report(results=[])
        result = render_fertilizer_report_pdf(report)
        assert isinstance(result, bytes)

    def test_none_optional_fields(self):
        report = _make_report(
            auth_code=None,
            auth_url=None,
            technical_responsible_registration=None,
            mapa_credential=None,
        )
        result = render_fertilizer_report_pdf(report)
        assert isinstance(result, bytes)

    def test_result_with_none_guarantee(self):
        report = _make_report(
            results=[FertilizerReportResultItem(parameter="Ca", unit="%", guarantee=None, result=3.0)]
        )
        result = render_fertilizer_report_pdf(report)
        assert isinstance(result, bytes)


class TestDrawHelpers:
    def _make_canvas(self):
        c = MagicMock()
        return c

    def test_draw_section_title(self):
        c = self._make_canvas()
        _draw_section_title(c, "TÍTULO", 100.0, 210.0)
        c.drawCentredString.assert_called_once()

    def test_draw_two_columns_equal_rows(self):
        c = self._make_canvas()
        left = [("Label A", "Value A"), ("Label B", "Value B")]
        right = [("Label C", "Value C"), ("Label D", "Value D")]
        y = _draw_two_columns(c, 200.0, 18.0, 192.0, left, right)
        assert isinstance(y, float)

    def test_draw_two_columns_unequal_rows(self):
        c = self._make_canvas()
        left = [("A", "1"), ("B", "2"), ("C", "3")]
        right = [("D", "4")]
        y = _draw_two_columns(c, 200.0, 18.0, 192.0, left, right)
        assert isinstance(y, float)

    def test_draw_two_columns_none_values(self):
        c = self._make_canvas()
        left = [("A", None)]
        right = [("B", None)]
        y = _draw_two_columns(c, 200.0, 18.0, 192.0, left, right)
        assert isinstance(y, float)

    def test_draw_results_table(self):
        c = self._make_canvas()
        report = _make_report()
        y = _draw_results_table(c, 200.0, 18.0, 192.0, report)
        assert isinstance(y, float)

    def test_draw_results_table_empty(self):
        c = self._make_canvas()
        report = _make_report(results=[])
        y = _draw_results_table(c, 200.0, 18.0, 192.0, report)
        assert isinstance(y, float)
