from uuid import uuid4

from app.schemas.fertilizer import (
    FertilizerReportPayloadRequest,
    FertilizerReportPayloadResponse,
    FertilizerReportResultItem,
)


def build_fertilizer_report_payload(
    payload: FertilizerReportPayloadRequest,
) -> FertilizerReportPayloadResponse:
    sample = payload.sample

    results = [
        FertilizerReportResultItem(
            parameter="Cálcio (Ca Total)",
            unit="%",
            result=sample.calcium_percent,
        ),
        FertilizerReportResultItem(
            parameter="Magnésio (Mg Total)",
            unit="%",
            result=sample.magnesium_percent,
        ),
        FertilizerReportResultItem(
            parameter="Enxofre (S - SO4)",
            unit="%",
            result=sample.sulfur_percent,
        ),
    ]

    return FertilizerReportPayloadResponse(
        request_number=payload.request_number,
        report_number=payload.report_number,
        requester=payload.requester,
        company_name=payload.company_name,
        received_at=payload.received_at,
        released_at=payload.released_at,
        property_name=payload.property_name,
        city=payload.city,
        sample_number=sample.sample_id,
        lot=payload.lot,
        ton=payload.ton,
        description=payload.description or sample.sample_line,
        reference=payload.reference,
        collected_at=payload.collected_at,
        manufactured_at=payload.manufactured_at,
        expires_at=payload.expires_at,
        technical_responsible_name=payload.technical_responsible_name
        or "Responsável Técnico",
        technical_responsible_role=payload.technical_responsible_role
        or "Responsável Técnico",
        technical_responsible_registration=payload.technical_responsible_registration,
        mapa_credential=payload.mapa_credential,
        auth_code=payload.auth_code or str(uuid4()).upper(),
        auth_url=payload.auth_url
        or "https://sistema.soloseplantas.com/areadocliente/autenticacao",
        results=results,
    )
