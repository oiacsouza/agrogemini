"""
Testes unitários – app/services/fertilizer_parser.py
Cobertura: parse_fertilizer_machine_file, ppm_to_percent, helpers privados
"""

import csv
import io
import zipfile
import struct
from xml.etree import ElementTree
import pytest

from app.services.fertilizer_parser import (
    parse_fertilizer_machine_file,
    ppm_to_percent,
    _read_rows,
    _read_csv_rows,
    _col_ref_to_index,
    _find_header_index,
    _build_column_symbols,
    _build_sample_from_row,
    _is_control_row,
    _parse_float,
    _normalize_token,
    _normalize_cell,
)


# ── Helpers para construção de CSV / XLSX mínimos ───────────────────────────

def _make_csv(rows: list[list[str]]) -> bytes:
    buf = io.StringIO()
    writer = csv.writer(buf)
    for row in rows:
        writer.writerow(row)
    return buf.getvalue().encode("utf-8")


_MINIMAL_CSV_ROWS = [
    ["SampleId", "SampleLine", "CA", "MG", "S"],
    ["SampleId", "SampleLine", "Calcium", "Magnesium", "Sulfur"],
    ["unit1", "unit2", "mg/L", "mg/L", "mg/L"],
    ["S001", "L001", "50000", "10000", "5000"],
    ["H2O", "BRANCO", "0", "0", "0"],    # linha de controle
    ["S002", "L002", "60000", "", "abc"],  # MG ausente, S inválido
    ["", "", "", "", ""],                  # linha vazia – deve ser ignorada
]

_EMPTY_CSV_ROWS = [
    ["SampleId", "SampleLine"],
    ["SampleId", "SampleLine"],
    [],
]


def _make_minimal_xlsx(rows: list[list[str]]) -> bytes:
    """Cria um .xlsx mínimo compatível com o parser."""
    # Workbook XML
    workbook_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"'
        ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        '<sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets>'
        "</workbook>"
    )
    rels_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"'
        ' Target="worksheets/sheet1.xml"/>'
        "</Relationships>"
    )

    # Constrói XML da planilha
    def col_letter(n: int) -> str:
        result = ""
        while n > 0:
            n, r = divmod(n - 1, 26)
            result = chr(65 + r) + result
        return result

    ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    worksheet = ElementTree.Element(f"{{{ns}}}worksheet")
    sheetdata = ElementTree.SubElement(worksheet, f"{{{ns}}}sheetData")
    shared: list[str] = []
    sid_map: dict[str, int] = {}

    def get_sid(val: str) -> int:
        if val not in sid_map:
            sid_map[val] = len(shared)
            shared.append(val)
        return sid_map[val]

    for ri, row in enumerate(rows, start=1):
        r_elem = ElementTree.SubElement(sheetdata, f"{{{ns}}}row", r=str(ri))
        for ci, cell_val in enumerate(row, start=1):
            ref = f"{col_letter(ci)}{ri}"
            c_elem = ElementTree.SubElement(r_elem, f"{{{ns}}}c", r=ref, t="s")
            v = ElementTree.SubElement(c_elem, f"{{{ns}}}v")
            v.text = str(get_sid(str(cell_val)))

    sheet_xml = ElementTree.tostring(worksheet, encoding="unicode", xml_declaration=False)
    sheet_xml = f'<?xml version="1.0" encoding="UTF-8"?>{sheet_xml}'

    # Shared strings XML
    ss_root = ElementTree.Element(
        "sst",
        xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main",
        count=str(len(shared)),
        uniqueCount=str(len(shared)),
    )
    for s in shared:
        si = ElementTree.SubElement(ss_root, "si")
        t = ElementTree.SubElement(si, "t")
        t.text = s
    ss_xml = f'<?xml version="1.0" encoding="UTF-8"?>{ElementTree.tostring(ss_root, encoding="unicode")}'

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("xl/workbook.xml", workbook_xml)
        zf.writestr("xl/_rels/workbook.xml.rels", rels_xml)
        zf.writestr("xl/worksheets/sheet1.xml", sheet_xml)
        zf.writestr("xl/sharedStrings.xml", ss_xml)
    return buf.getvalue()


# ── ppm_to_percent ───────────────────────────────────────────────────────────

class TestPpmToPercent:
    def test_none_returns_none(self):
        assert ppm_to_percent(None) is None

    def test_basic_conversion(self):
        assert ppm_to_percent(10_000) == 1.0

    def test_rounding(self):
        assert ppm_to_percent(33_333) == 3.33

    def test_custom_decimals(self):
        assert ppm_to_percent(33_333, decimals=4) == 3.3333

    def test_zero(self):
        assert ppm_to_percent(0) == 0.0


# ── _parse_float ─────────────────────────────────────────────────────────────

class TestParseFloat:
    def test_valid_number(self):
        assert _parse_float("123.45") == 123.45

    def test_comma_decimal(self):
        assert _parse_float("123,45") == 123.45

    def test_empty_returns_none(self):
        assert _parse_float("") is None

    def test_whitespace_returns_none(self):
        assert _parse_float("   ") is None

    def test_text_returns_none(self):
        assert _parse_float("abc") is None

    def test_integer_string(self):
        assert _parse_float("42") == 42.0


# ── _normalize_token / _normalize_cell ───────────────────────────────────────

class TestNormalizeHelpers:
    def test_normalize_token_strips_special_chars(self):
        assert _normalize_token("Sample Id!") == "sampleid"

    def test_normalize_token_lowercase(self):
        assert _normalize_token("SAMPLEID") == "sampleid"

    def test_normalize_cell_strips_whitespace(self):
        assert _normalize_cell("  hello  ") == "hello"

    def test_normalize_cell_non_string(self):
        assert _normalize_cell(42) == "42"  # type: ignore


# ── _col_ref_to_index ─────────────────────────────────────────────────────────

class TestColRefToIndex:
    def test_a1_returns_1(self):
        assert _col_ref_to_index("A1") == 1

    def test_b1_returns_2(self):
        assert _col_ref_to_index("B1") == 2

    def test_z1_returns_26(self):
        assert _col_ref_to_index("Z1") == 26

    def test_aa1_returns_27(self):
        assert _col_ref_to_index("AA1") == 27

    def test_empty_ref_returns_0(self):
        assert _col_ref_to_index("") == 0

    def test_numeric_only_returns_0(self):
        assert _col_ref_to_index("123") == 0


# ── _find_header_index ────────────────────────────────────────────────────────

class TestFindHeaderIndex:
    def test_finds_header_at_index_0(self):
        rows = [["SampleId", "SampleLine", "CA"]]
        assert _find_header_index(rows) == 0

    def test_finds_header_at_index_2(self):
        rows = [["Info"], ["Info2"], ["SampleId", "SampleLine"]]
        assert _find_header_index(rows) == 2

    def test_returns_none_when_not_found(self):
        rows = [["A", "B"], ["C", "D"]]
        assert _find_header_index(rows) is None

    def test_short_row_skipped(self):
        rows = [["SampleId"], ["SampleId", "SampleLine"]]
        assert _find_header_index(rows) == 1


# ── _build_column_symbols ─────────────────────────────────────────────────────

class TestBuildColumnSymbols:
    def test_first_two_columns_fixed(self):
        symbols = _build_column_symbols(["SampleId", "SampleLine", "Calcium (Ca)"])
        assert symbols[0] == "SampleId"
        assert symbols[1] == "SampleLine"

    def test_element_symbols_extracted(self):
        symbols = _build_column_symbols(["SampleId", "SampleLine", "Ca mg/L", "Mg %"])
        assert symbols[2] == "CA"
        assert symbols[3] == "MG"

    def test_unrecognized_column_gets_fallback(self):
        symbols = _build_column_symbols(["SampleId", "SampleLine", "123abc"])
        assert symbols[2] == "COL_2"

    def test_empty_header_list(self):
        assert _build_column_symbols([]) == []


# ── _is_control_row ───────────────────────────────────────────────────────────

class TestIsControlRow:
    @pytest.mark.parametrize("machine_id,line", [
        ("H2O", ""),
        ("", "BRANCO"),
        ("PADRAO", "L001"),
        ("S001", "CLEANOUT"),
        ("AGUA", ""),
    ])
    def test_control_row_detected(self, machine_id, line):
        assert _is_control_row(machine_id, line) is True

    def test_non_control_row(self):
        assert _is_control_row("S001", "L001") is False

    def test_case_insensitive(self):
        assert _is_control_row("h2o", "l001") is True


# ── _build_sample_from_row ────────────────────────────────────────────────────

class TestBuildSampleFromRow:
    def _symbols(self):
        return ["SampleId", "SampleLine", "CA", "MG", "S"]

    def test_valid_row_builds_sample(self):
        row = ["S001", "L001", "50000", "10000", "5000"]
        sample = _build_sample_from_row(row, self._symbols())
        assert sample is not None
        assert sample.sample_id == "L001"
        assert sample.elements_ppm["CA"] == 50000.0
        assert sample.calcium_percent == 5.0

    def test_empty_row_returns_none(self):
        assert _build_sample_from_row([], self._symbols()) is None

    def test_both_ids_empty_returns_none(self):
        row = ["", "", "50000"]
        assert _build_sample_from_row(row, self._symbols()) is None

    def test_control_row_flagged(self):
        row = ["H2O", "BRANCO", "0", "0", "0"]
        sample = _build_sample_from_row(row, self._symbols())
        assert sample is not None
        assert sample.is_control is True

    def test_missing_value_skipped(self):
        row = ["S001", "L001", "", "10000"]
        symbols = ["SampleId", "SampleLine", "CA", "MG"]
        sample = _build_sample_from_row(row, symbols)
        assert sample is not None
        assert "CA" not in sample.elements_ppm
        assert sample.elements_ppm["MG"] == 10000.0

    def test_sample_id_uses_machine_id_when_line_empty(self):
        row = ["S001", ""]
        symbols = ["SampleId", "SampleLine"]
        sample = _build_sample_from_row(row, symbols)
        assert sample is not None
        assert sample.sample_id == "S001"


# ── parse_fertilizer_machine_file (CSV) ──────────────────────────────────────

class TestParseFertilizerCSV:
    def test_parse_valid_csv(self):
        content = _make_csv(_MINIMAL_CSV_ROWS)
        result = parse_fertilizer_machine_file("data.csv", content)
        assert result.processed_samples == 2  # S001 e S002 (H2O é controle, linha vazia ignorada)
        assert result.skipped_controls == 1

    def test_parse_csv_include_controls(self):
        content = _make_csv(_MINIMAL_CSV_ROWS)
        result = parse_fertilizer_machine_file("data.csv", content, include_controls=True)
        assert result.processed_samples == 3  # S001, H2O, S002

    def test_available_elements_sorted(self):
        content = _make_csv(_MINIMAL_CSV_ROWS)
        result = parse_fertilizer_machine_file("data.csv", content)
        assert result.available_elements == sorted(result.available_elements)

    def test_file_name_preserved(self):
        content = _make_csv(_MINIMAL_CSV_ROWS)
        result = parse_fertilizer_machine_file("meu_arquivo.csv", content)
        assert result.file_name == "meu_arquivo.csv"

    def test_empty_data_raises_value_error(self):
        empty = _make_csv([])
        with pytest.raises(ValueError, match="sem dados"):
            parse_fertilizer_machine_file("empty.csv", empty)

    def test_no_header_raises_value_error(self):
        no_header = _make_csv([["A", "B", "C"], ["1", "2", "3"]])
        with pytest.raises(ValueError, match="não reconhecido"):
            parse_fertilizer_machine_file("no_header.csv", no_header)

    def test_unsupported_extension_raises_value_error(self):
        with pytest.raises(ValueError, match="Formato não suportado"):
            parse_fertilizer_machine_file("data.txt", b"content")

    def test_total_rows_count(self):
        content = _make_csv(_MINIMAL_CSV_ROWS)
        result = parse_fertilizer_machine_file("data.csv", content)
        assert result.total_rows == len(_MINIMAL_CSV_ROWS)


# ── parse_fertilizer_machine_file (XLSX) ─────────────────────────────────────

class TestParseFertilizerXLSX:
    def test_parse_valid_xlsx(self):
        content = _make_minimal_xlsx(_MINIMAL_CSV_ROWS)
        result = parse_fertilizer_machine_file("data.xlsx", content)
        assert result.processed_samples >= 1
        assert result.sheet_name == "Sheet1"

    def test_xlsx_with_controls_excluded(self):
        content = _make_minimal_xlsx(_MINIMAL_CSV_ROWS)
        result = parse_fertilizer_machine_file("data.xlsx", content, include_controls=False)
        # pelo menos o controle H2O deve ser pulado
        assert result.skipped_controls >= 1

    def test_xlsx_include_controls(self):
        content = _make_minimal_xlsx(_MINIMAL_CSV_ROWS)
        excl = parse_fertilizer_machine_file("data.xlsx", content, include_controls=False)
        incl = parse_fertilizer_machine_file("data.xlsx", content, include_controls=True)
        assert incl.processed_samples >= excl.processed_samples


# ── _read_rows dispatcher ─────────────────────────────────────────────────────

class TestReadRows:
    def test_csv_extension_routed(self):
        content = _make_csv([["SampleId", "SampleLine"]])
        rows, sheet = _read_rows("file.csv", content)
        assert isinstance(rows, list)
        assert sheet is None

    def test_xlsx_extension_routed(self):
        content = _make_minimal_xlsx([["SampleId", "SampleLine"]])
        rows, sheet = _read_rows("file.xlsx", content)
        assert isinstance(rows, list)

    def test_unsupported_raises(self):
        with pytest.raises(ValueError):
            _read_rows("file.xls", b"garbage")
