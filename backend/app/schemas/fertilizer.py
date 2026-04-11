from pydantic import BaseModel, Field


class FertilizerSamplePreview(BaseModel):
    sample_id: str
    machine_sample_id: str | None = None
    sample_line: str | None = None
    is_control: bool = False
    calcium_ppm: float | None = None
    magnesium_ppm: float | None = None
    sulfur_ppm: float | None = None
    calcium_percent: float | None = None
    magnesium_percent: float | None = None
    sulfur_percent: float | None = None
    elements_ppm: dict[str, float] = Field(default_factory=dict)


class FertilizerPreviewResponse(BaseModel):
    file_name: str
    sheet_name: str | None = None
    total_rows: int
    processed_samples: int
    skipped_controls: int
    available_elements: list[str]
    samples: list[FertilizerSamplePreview]


class FertilizerReportPayloadRequest(BaseModel):
    sample: FertilizerSamplePreview
    request_number: str | None = None
    report_number: str | None = None
    requester: str | None = None
    company_name: str | None = None
    received_at: str | None = None
    released_at: str | None = None
    property_name: str | None = None
    city: str | None = None
    lot: str | None = None
    ton: str | None = None
    description: str | None = None
    reference: str | None = None
    collected_at: str | None = None
    manufactured_at: str | None = None
    expires_at: str | None = None
    technical_responsible_name: str | None = None
    technical_responsible_role: str | None = None
    technical_responsible_registration: str | None = None
    mapa_credential: str | None = None
    auth_code: str | None = None
    auth_url: str | None = None


class FertilizerReportResultItem(BaseModel):
    parameter: str
    unit: str
    guarantee: str | None = None
    result: float | None = None


class FertilizerReportPayloadResponse(BaseModel):
    request_number: str | None = None
    report_number: str | None = None
    requester: str | None = None
    company_name: str | None = None
    received_at: str | None = None
    released_at: str | None = None
    property_name: str | None = None
    city: str | None = None
    sample_number: str
    lot: str | None = None
    ton: str | None = None
    description: str | None = None
    reference: str | None = None
    collected_at: str | None = None
    manufactured_at: str | None = None
    expires_at: str | None = None
    technical_responsible_name: str | None = None
    technical_responsible_role: str | None = None
    technical_responsible_registration: str | None = None
    mapa_credential: str | None = None
    auth_code: str | None = None
    auth_url: str | None = None
    results: list[FertilizerReportResultItem]
