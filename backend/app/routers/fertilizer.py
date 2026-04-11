from fastapi import APIRouter, File, HTTPException, Query, Response, UploadFile

from app.schemas.fertilizer import (
    FertilizerPreviewResponse,
    FertilizerReportPayloadRequest,
    FertilizerReportPayloadResponse,
)
from app.services.fertilizer_parser import parse_fertilizer_machine_file
from app.services.fertilizer_pdf import render_fertilizer_report_pdf
from app.services.fertilizer_report import build_fertilizer_report_payload

router = APIRouter(prefix="/fertilizers", tags=["fertilizers"])


@router.post("/preview", response_model=FertilizerPreviewResponse)
async def preview_fertilizer_file(
    file: UploadFile = File(...),
    include_controls: bool = Query(
        False,
        description="Se true, mantém linhas de controle (ex: BRANCO/PADRÃO/H2O) no resultado.",
    ),
) -> FertilizerPreviewResponse:
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Arquivo vazio.")

    try:
        return parse_fertilizer_machine_file(
            filename=file.filename or "arquivo_sem_nome",
            content=content,
            include_controls=include_controls,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/report/payload", response_model=FertilizerReportPayloadResponse)
def fertilizer_report_payload(
    payload: FertilizerReportPayloadRequest,
) -> FertilizerReportPayloadResponse:
    return build_fertilizer_report_payload(payload)


@router.post("/report/pdf")
def fertilizer_report_pdf(payload: FertilizerReportPayloadRequest) -> Response:
    report_payload = build_fertilizer_report_payload(payload)
    pdf_bytes = render_fertilizer_report_pdf(report_payload)

    report_id = (report_payload.report_number or report_payload.sample_number).replace("/", "-")
    filename = f"laudo-fertilizante-{report_id}.pdf"
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)
