from __future__ import annotations

import csv
import io
import re
import zipfile
from xml.etree import ElementTree

from app.schemas.fertilizer import FertilizerPreviewResponse, FertilizerSamplePreview

_NAMESPACE = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
_CONTROL_MARKERS = ("H2O", "BRANCO", "PADRAO", "CLEANOUT", "AGUA")


def parse_fertilizer_machine_file(
    filename: str,
    content: bytes,
    include_controls: bool = False,
) -> FertilizerPreviewResponse:
    rows, sheet_name = _read_rows(filename=filename, content=content)
    if not rows:
        raise ValueError("Arquivo sem dados de leitura.")

    header_index = _find_header_index(rows)
    if header_index is None:
        raise ValueError(
            "Formato de planilha não reconhecido. Esperado cabeçalho com "
            "'SampleId' e 'SampleLine'."
        )

    raw_headers = rows[header_index + 1] if len(rows) > header_index + 1 else []
    column_symbols = _build_column_symbols(raw_headers)

    samples: list[FertilizerSamplePreview] = []
    skipped_controls = 0
    available_elements: set[str] = set()

    for row in rows[header_index + 3 :]:
        sample = _build_sample_from_row(row, column_symbols)
        if sample is None:
            continue

        if sample.is_control and not include_controls:
            skipped_controls += 1
            continue

        available_elements.update(sample.elements_ppm.keys())
        samples.append(sample)

    return FertilizerPreviewResponse(
        file_name=filename,
        sheet_name=sheet_name,
        total_rows=len(rows),
        processed_samples=len(samples),
        skipped_controls=skipped_controls,
        available_elements=sorted(available_elements),
        samples=samples,
    )


def ppm_to_percent(value_ppm: float | None, decimals: int = 2) -> float | None:
    if value_ppm is None:
        return None
    return round(value_ppm / 10_000, decimals)


def _read_rows(filename: str, content: bytes) -> tuple[list[list[str]], str | None]:
    lowered = filename.lower()
    if lowered.endswith(".xlsx"):
        return _read_xlsx_rows(content)
    if lowered.endswith(".csv"):
        return _read_csv_rows(content), None
    raise ValueError("Formato não suportado. Envie arquivo .csv ou .xlsx.")


def _read_csv_rows(content: bytes) -> list[list[str]]:
    decoded = content.decode("utf-8-sig", errors="ignore")
    reader = csv.reader(io.StringIO(decoded))
    return [list(map(_normalize_cell, row)) for row in reader]


def _read_xlsx_rows(content: bytes) -> tuple[list[list[str]], str | None]:
    with zipfile.ZipFile(io.BytesIO(content)) as archive:
        workbook = ElementTree.fromstring(archive.read("xl/workbook.xml"))
        sheets = workbook.findall(".//x:sheets/x:sheet", _NAMESPACE)
        if not sheets:
            return [], None

        first_sheet = sheets[0]
        sheet_name = first_sheet.attrib.get("name")
        relationship_id = first_sheet.attrib.get(
            "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
        )
        if not relationship_id:
            return [], sheet_name

        rels = ElementTree.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        target_by_id = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels}
        target = target_by_id.get(relationship_id)
        if not target:
            return [], sheet_name

        if target.startswith("/"):
            sheet_xml_path = target[1:]
        elif target.startswith("xl/"):
            sheet_xml_path = target
        else:
            sheet_xml_path = f"xl/{target}"

        shared_strings = _read_shared_strings(archive)
        sheet_root = ElementTree.fromstring(archive.read(sheet_xml_path))
        rows: list[list[str]] = []
        for row in sheet_root.findall(".//x:sheetData/x:row", _NAMESPACE):
            indexed_values: dict[int, str] = {}
            max_col_index = 0
            for cell in row.findall("x:c", _NAMESPACE):
                ref = cell.attrib.get("r", "")
                col_index = _col_ref_to_index(ref)
                if col_index == 0:
                    continue

                value = _read_cell_value(cell, shared_strings)
                indexed_values[col_index] = _normalize_cell(value)
                max_col_index = max(max_col_index, col_index)

            if max_col_index == 0:
                rows.append([])
                continue

            rows.append([indexed_values.get(i, "") for i in range(1, max_col_index + 1)])

        return rows, sheet_name


def _read_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []

    shared_root = ElementTree.fromstring(archive.read("xl/sharedStrings.xml"))
    values: list[str] = []
    for item in shared_root.findall("x:si", _NAMESPACE):
        text_parts = [node.text or "" for node in item.findall(".//x:t", _NAMESPACE)]
        values.append("".join(text_parts))
    return values


def _read_cell_value(cell: ElementTree.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    if cell_type == "inlineStr":
        text_node = cell.find(".//x:t", _NAMESPACE)
        return text_node.text if text_node is not None and text_node.text else ""

    value_node = cell.find("x:v", _NAMESPACE)
    if value_node is None or value_node.text is None:
        return ""

    raw_value = value_node.text
    if cell_type == "s":
        try:
            return shared_strings[int(raw_value)]
        except (IndexError, ValueError):
            return raw_value
    return raw_value


def _col_ref_to_index(ref: str) -> int:
    letters = "".join(char for char in ref if char.isalpha())
    if not letters:
        return 0

    total = 0
    for letter in letters:
        total = total * 26 + (ord(letter.upper()) - 64)
    return total


def _find_header_index(rows: list[list[str]]) -> int | None:
    for index, row in enumerate(rows):
        if len(row) < 2:
            continue
        left = _normalize_token(row[0])
        right = _normalize_token(row[1])
        if left == "sampleid" and right == "sampleline":
            return index
    return None


def _build_column_symbols(raw_headers: list[str]) -> list[str]:
    symbols: list[str] = []
    for col_index, raw_header in enumerate(raw_headers):
        if col_index == 0:
            symbols.append("SampleId")
            continue
        if col_index == 1:
            symbols.append("SampleLine")
            continue

        match = re.match(r"^\s*([A-Za-z]{1,2})\b", raw_header or "")
        symbols.append(match.group(1).upper() if match else f"COL_{col_index}")
    return symbols


def _build_sample_from_row(
    row: list[str],
    column_symbols: list[str],
) -> FertilizerSamplePreview | None:
    if not row:
        return None

    machine_sample_id = row[0].strip() if len(row) > 0 else ""
    sample_line = row[1].strip() if len(row) > 1 else ""
    if not machine_sample_id and not sample_line:
        return None

    sample_id = sample_line or machine_sample_id

    elements_ppm: dict[str, float] = {}
    max_columns = min(len(row), len(column_symbols))
    for index in range(2, max_columns):
        symbol = column_symbols[index]
        parsed = _parse_float(row[index])
        if parsed is None:
            continue
        elements_ppm[symbol] = parsed

    is_control = _is_control_row(
        machine_sample_id=machine_sample_id,
        sample_line=sample_line,
    )
    ca_ppm = elements_ppm.get("CA")
    mg_ppm = elements_ppm.get("MG")
    s_ppm = elements_ppm.get("S")

    return FertilizerSamplePreview(
        sample_id=sample_id,
        machine_sample_id=machine_sample_id or None,
        sample_line=sample_line or None,
        is_control=is_control,
        calcium_ppm=ca_ppm,
        magnesium_ppm=mg_ppm,
        sulfur_ppm=s_ppm,
        calcium_percent=ppm_to_percent(ca_ppm),
        magnesium_percent=ppm_to_percent(mg_ppm),
        sulfur_percent=ppm_to_percent(s_ppm),
        elements_ppm=elements_ppm,
    )


def _is_control_row(machine_sample_id: str, sample_line: str) -> bool:
    row_text = f"{machine_sample_id} {sample_line}".upper()
    return any(marker in row_text for marker in _CONTROL_MARKERS)


def _parse_float(value: str) -> float | None:
    normalized = value.strip()
    if not normalized:
        return None

    try:
        return float(normalized.replace(",", "."))
    except ValueError:
        return None


def _normalize_token(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def _normalize_cell(value: str) -> str:
    return value.strip() if isinstance(value, str) else str(value)
