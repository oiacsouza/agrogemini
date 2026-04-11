from __future__ import annotations

from datetime import datetime
from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

from app.schemas.fertilizer import FertilizerReportPayloadResponse


def render_fertilizer_report_pdf(report: FertilizerReportPayloadResponse) -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    page_width, page_height = A4

    margin_left = 18 * mm
    margin_right = page_width - (18 * mm)
    y = page_height - (18 * mm)

    pdf.setTitle(f"Laudo Fertilizante {report.report_number or report.sample_number}")
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawCentredString(page_width / 2, y, "LAUDO DE FERTILIZANTE")
    y -= 10 * mm

    left_header = [
        ("No Pedido", report.request_number),
        ("Solicitante", report.requester),
        ("Razao Social", report.company_name),
        ("Propriedade", report.property_name),
    ]
    right_header = [
        ("No Laudo", report.report_number),
        ("Data de Entrada", report.received_at),
        ("Data de Saida", report.released_at),
        ("Cidade", report.city),
    ]
    y = _draw_two_columns(pdf, y, margin_left, margin_right, left_header, right_header)
    y -= 6 * mm

    _draw_section_title(pdf, "REGISTRO DA AMOSTRA", y, page_width)
    y -= 6 * mm

    left_sample = [
        ("No Amostra", report.sample_number),
        ("M.A.P.A.", report.mapa_credential),
        ("Data de Coleta", report.collected_at),
        ("Data de Fabricacao", report.manufactured_at),
        ("Data de Validade", report.expires_at),
    ]
    right_sample = [
        ("Lote", report.lot),
        ("Ton", report.ton),
        ("Descricao", report.description),
        ("Ref", report.reference),
    ]
    y = _draw_two_columns(pdf, y, margin_left, margin_right, left_sample, right_sample)
    y -= 6 * mm

    _draw_section_title(pdf, "RESULTADO DA AMOSTRA", y, page_width)
    y -= 8 * mm
    y = _draw_results_table(pdf, y, margin_left, margin_right, report)

    footer_y = 28 * mm
    issued_city = report.city or "SINOP/MT"
    issued_date = datetime.now().strftime("%d/%m/%Y")
    pdf.setFont("Helvetica", 8)
    pdf.drawRightString(margin_right, footer_y + (22 * mm), f"{issued_city}, {issued_date}")

    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawRightString(
        margin_right,
        footer_y + (14 * mm),
        _fit(report.technical_responsible_name, 42) or "Responsavel Tecnico",
    )
    pdf.setFont("Helvetica", 8)
    pdf.drawRightString(
        margin_right,
        footer_y + (10 * mm),
        _fit(report.technical_responsible_role, 42) or "Responsavel Tecnico",
    )
    pdf.drawRightString(
        margin_right,
        footer_y + (6 * mm),
        _fit(report.technical_responsible_registration, 42),
    )

    pdf.setFont("Helvetica", 7)
    pdf.drawString(margin_left, footer_y + (8 * mm), "Observacoes:")
    pdf.drawString(
        margin_left,
        footer_y + (5 * mm),
        "Teste realizado conforme IN37/2023 - Manual de Metodos Analiticos Oficiais.",
    )
    pdf.drawString(
        margin_left,
        footer_y + (2 * mm),
        "Resultados referentes a amostra entregue ao laboratorio.",
    )

    pdf.setFont("Helvetica-Bold", 7)
    pdf.drawString(margin_left, footer_y - (2 * mm), _fit(report.auth_code, 60))
    pdf.setFont("Helvetica", 7)
    pdf.drawString(
        margin_left,
        footer_y - (5 * mm),
        _fit(report.auth_url, 92),
    )

    pdf.showPage()
    pdf.save()
    return buffer.getvalue()


def _draw_section_title(pdf: canvas.Canvas, title: str, y: float, page_width: float) -> None:
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawCentredString(page_width / 2, y, title)


def _draw_two_columns(
    pdf: canvas.Canvas,
    start_y: float,
    left_x: float,
    right_x: float,
    left_rows: list[tuple[str, str | None]],
    right_rows: list[tuple[str, str | None]],
) -> float:
    row_height = 5 * mm
    split_x = left_x + ((right_x - left_x) / 2)
    value_offset = 26 * mm
    rows = max(len(left_rows), len(right_rows))

    for row_index in range(rows):
        y = start_y - (row_index * row_height)
        if row_index < len(left_rows):
            label, value = left_rows[row_index]
            pdf.setFont("Helvetica-Bold", 8)
            pdf.drawString(left_x, y, f"{label}:")
            pdf.setFont("Helvetica", 8)
            pdf.drawString(left_x + value_offset, y, _fit(value, 34))

        if row_index < len(right_rows):
            label, value = right_rows[row_index]
            pdf.setFont("Helvetica-Bold", 8)
            pdf.drawString(split_x, y, f"{label}:")
            pdf.setFont("Helvetica", 8)
            pdf.drawString(split_x + value_offset, y, _fit(value, 30))

    return start_y - (rows * row_height)


def _draw_results_table(
    pdf: canvas.Canvas,
    start_y: float,
    left_x: float,
    right_x: float,
    report: FertilizerReportPayloadResponse,
) -> float:
    table_width = right_x - left_x
    columns = [
        ("Parametro", 0.44),
        ("Unidade", 0.14),
        ("Garantia", 0.18),
        ("Resultado", 0.24),
    ]
    col_widths = [table_width * factor for _, factor in columns]

    header_h = 7 * mm
    row_h = 6 * mm
    rows_h = row_h * len(report.results)
    table_height = header_h + rows_h
    bottom_y = start_y - table_height

    pdf.rect(left_x, bottom_y, table_width, table_height, stroke=1, fill=0)
    pdf.setFillGray(0.92)
    pdf.rect(left_x, start_y - header_h, table_width, header_h, stroke=0, fill=1)
    pdf.setFillGray(0)

    x = left_x
    for col_index, (title, width) in enumerate(zip([c[0] for c in columns], col_widths)):
        if col_index > 0:
            pdf.line(x, bottom_y, x, start_y)
        pdf.setFont("Helvetica-Bold", 8)
        pdf.drawCentredString(x + (width / 2), start_y - (header_h * 0.7), title)
        x += width

    for index, item in enumerate(report.results):
        y_top = start_y - header_h - (index * row_h)
        y_bottom = y_top - row_h
        pdf.line(left_x, y_bottom, right_x, y_bottom)

        values = [
            _fit(item.parameter, 48),
            _fit(item.unit, 10),
            _fit(item.guarantee, 14),
            _format_decimal(item.result),
        ]
        x = left_x
        for col_index, (value, width) in enumerate(zip(values, col_widths)):
            pdf.setFont("Helvetica", 8)
            if col_index == 0:
                pdf.drawString(x + (2 * mm), y_top - (row_h * 0.72), value)
            else:
                pdf.drawCentredString(x + (width / 2), y_top - (row_h * 0.72), value)
            x += width

    return bottom_y


def _fit(value: str | None, max_chars: int) -> str:
    text = (value or "").strip()
    if len(text) <= max_chars:
        return text
    return f"{text[: max_chars - 3]}..."


def _format_decimal(value: float | None) -> str:
    if value is None:
        return ""
    return f"{value:.2f}".replace(".", ",")

