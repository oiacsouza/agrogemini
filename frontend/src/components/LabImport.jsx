import React, { useState, useCallback, useRef } from 'react';
import {
  UploadCloud,
  Upload,
  UserPlus,
  ChevronDown,
  Crown,
  AlertTriangle,
  FileText,
  TestTube2,
  Calculator,
  Sparkles,
  ClipboardCheck,
  Download,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Modal } from './ui/Modal';
import { PlanModal } from './PlanModal';
import { toast } from './ui/Toast';
import { mockClients } from '../mockData';
import { InputField } from './ui/InputField';
import { useLab } from '../context/LabContext';
import { useLabTheme } from './lab/useLabTheme';

const emptyClient = { name: '', email: '' };
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value) => Math.round((value + Number.EPSILON) * 10) / 10;

const formatFileSize = (bytes = 0) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const formatDateTime = (dateLike) => {
  const dt = new Date(dateLike);
  if (Number.isNaN(dt.getTime())) return '-';
  return dt.toLocaleString('pt-BR');
};

const normalizeText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[^\w\s]/g, '')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const toNumber = (value) => {
  if (value === undefined || value === null) return null;
  const normalized = String(value).replace(/\./g, '').replace(',', '.').match(/-?\d+(\.\d+)?/);
  if (!normalized) return null;
  const num = Number(normalized[0]);
  return Number.isFinite(num) ? num : null;
};

function hashString(value = '') {
  let hash = 0;
  const text = String(value);
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function scoreRange(value, minIdeal, maxIdeal) {
  const midpoint = (minIdeal + maxIdeal) / 2;
  const diff = Math.abs(value - midpoint);
  const tolerance = Math.max((maxIdeal - minIdeal) / 2, 0.1);
  return clamp(100 - (diff / tolerance) * 35, 45, 100);
}

function getBand(value, minIdeal, maxIdeal) {
  if (value < minIdeal) return { label: 'Baixo', tone: '#f59e0b' };
  if (value > maxIdeal) return { label: 'Alto', tone: '#ef4444' };
  return { label: 'Ideal', tone: '#10b981' };
}

function detectDelimiter(headerLine = '') {
  return headerLine.split(';').length >= headerLine.split(',').length ? ';' : ',';
}

function parseMetricsFromText(text = '') {
  const lines = String(text)
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return {};

  const delimiter = detectDelimiter(lines[0]);
  const headers = lines[0].split(delimiter).map(normalizeText);

  const dataLine = lines.find((line, idx) => idx > 0 && line.includes(delimiter));
  if (!dataLine) return {};

  const values = dataLine.split(delimiter);
  const pick = (aliases) => {
    const idx = headers.findIndex(header => aliases.some(alias => header.includes(alias)));
    if (idx < 0 || idx >= values.length) return null;
    return toNumber(values[idx]);
  };

  return {
    ph: pick(['ph']),
    phosphorus: pick(['fosforo', 'phosphorus', 'p mg', 'p(mg']),
    potassium: pick(['potassio', 'potassium', 'k ']),
    calcium: pick(['calcio', 'calcium', 'ca ']),
    magnesium: pick(['magnesio', 'magnesium', 'mg ']),
    organicMatter: pick(['materia organica', 'organic', 'mo ']),
  };
}

function getSeededMetric(seed, min, max, salt) {
  const trig = (Math.sin(seed + (salt * 97.13)) + 1) / 2;
  return round(min + trig * (max - min));
}

function deriveMetrics(file, parsed = {}) {
  const seed = hashString(`${file?.name || ''}-${file?.size || 0}-${file?.lastModified || 0}`);

  return {
    ph: parsed.ph ?? getSeededMetric(seed, 5.2, 6.8, 1),
    phosphorus: parsed.phosphorus ?? getSeededMetric(seed, 8, 42, 2),
    potassium: parsed.potassium ?? getSeededMetric(seed, 0.1, 0.42, 3),
    calcium: parsed.calcium ?? getSeededMetric(seed, 1.2, 5.8, 4),
    magnesium: parsed.magnesium ?? getSeededMetric(seed, 0.5, 2.4, 5),
    organicMatter: parsed.organicMatter ?? getSeededMetric(seed, 1.6, 5.2, 6),
  };
}

async function parseImportedSample({ file, selectedClientData }) {
  let parsed = {};

  if (file && file.size <= 2 * 1024 * 1024) {
    try {
      const text = await file.text();
      parsed = parseMetricsFromText(text);
    } catch {
      parsed = {};
    }
  }

  const metrics = deriveMetrics(file, parsed);
  const uploadedAt = new Date().toISOString();
  const baseName = (file?.name || 'amostra_demo').replace(/\.[^.]+$/, '');
  const sampleCode = baseName
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 10) || `AG${Date.now().toString().slice(-6)}`;

  return {
    id: `${Date.now()}-${sampleCode}`,
    fileName: file?.name || 'amostra_demo.csv',
    fileSize: file?.size || 0,
    uploadedAt,
    sampleCode,
    clientName: selectedClientData?.name || 'Cliente Demo',
    fieldName: 'Talhão Principal',
    analysisType: 'Fertilidade Completa',
    metrics,
  };
}

function calculateReport(sample) {
  const { metrics } = sample;

  const phScore = scoreRange(metrics.ph, 5.8, 6.6);
  const phosphorusScore = scoreRange(metrics.phosphorus, 16, 32);
  const potassiumScore = scoreRange(metrics.potassium, 0.18, 0.35);
  const calciumScore = scoreRange(metrics.calcium, 2.0, 5.0);
  const magnesiumScore = scoreRange(metrics.magnesium, 0.7, 2.0);
  const organicScore = scoreRange(metrics.organicMatter, 2.5, 4.5);

  const fertilityScore = round(
    phScore * 0.2
    + phosphorusScore * 0.2
    + potassiumScore * 0.18
    + calciumScore * 0.16
    + magnesiumScore * 0.1
    + organicScore * 0.16
  );

  const qualityLabel = fertilityScore >= 82
    ? 'Excelente'
    : fertilityScore >= 72
      ? 'Boa'
      : fertilityScore >= 60
        ? 'Atenção'
        : 'Crítica';

  const recommendedCrop = fertilityScore >= 80
    ? 'Soja'
    : fertilityScore >= 68
      ? 'Milho'
      : 'Brachiaria + Correção';

  const correctionPlan = [];
  if (metrics.ph < 5.8) correctionPlan.push('Aplicar calcário dolomítico (1.8 t/ha) para correção de pH.');
  if (metrics.phosphorus < 16) correctionPlan.push('Reforçar fósforo com MAP/SSP na próxima adubação de base.');
  if (metrics.potassium < 0.18) correctionPlan.push('Ajustar potássio com KCl em cobertura fracionada.');
  if (metrics.organicMatter < 2.5) correctionPlan.push('Elevar matéria orgânica com adubação verde e rotação de culturas.');
  if (!correctionPlan.length) correctionPlan.push('Manter manejo atual e repetir amostragem em 45 dias.');

  return {
    fertilityScore,
    qualityLabel,
    recommendedCrop,
    correctionPlan,
    generatedAt: new Date().toISOString(),
    metrics: [
      { key: 'pH', value: metrics.ph, unit: '', ...getBand(metrics.ph, 5.8, 6.6), score: round(phScore) },
      { key: 'Fósforo', value: metrics.phosphorus, unit: 'mg/dm³', ...getBand(metrics.phosphorus, 16, 32), score: round(phosphorusScore) },
      { key: 'Potássio', value: metrics.potassium, unit: 'cmolc/dm³', ...getBand(metrics.potassium, 0.18, 0.35), score: round(potassiumScore) },
      { key: 'Cálcio', value: metrics.calcium, unit: 'cmolc/dm³', ...getBand(metrics.calcium, 2.0, 5.0), score: round(calciumScore) },
      { key: 'Magnésio', value: metrics.magnesium, unit: 'cmolc/dm³', ...getBand(metrics.magnesium, 0.7, 2.0), score: round(magnesiumScore) },
      { key: 'Matéria Orgânica', value: metrics.organicMatter, unit: '%', ...getBand(metrics.organicMatter, 2.5, 4.5), score: round(organicScore) },
    ],
  };
}

function generatePdf({ sample, report, sourceLabel }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(17);
  doc.text('AgroGemini', 14, 12);
  doc.setFontSize(11);
  doc.text('Laudo Técnico de Fertilidade do Solo', 14, 20);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(`Amostra: ${sample.sampleCode}`, 14, 36);
  doc.text(`Arquivo: ${sample.fileName}`, 14, 42);
  doc.text(`Cliente: ${sample.clientName}`, 14, 48);
  doc.text(`Talhão: ${sample.fieldName}`, 14, 54);
  doc.text(`Fonte de dados: ${sourceLabel}`, 14, 60);
  doc.text(`Gerado em: ${formatDateTime(report.generatedAt)}`, 14, 66);

  doc.setFontSize(12);
  doc.text('Resumo do Resultado', 14, 78);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 80, 196, 80);

  doc.setFontSize(10);
  doc.text(`Índice de fertilidade: ${report.fertilityScore}/100`, 14, 87);
  doc.text(`Classificação: ${report.qualityLabel}`, 14, 93);
  doc.text(`Recomendação de cultura: ${report.recommendedCrop}`, 14, 99);

  doc.setFontSize(12);
  doc.text('Parâmetros Analisados', 14, 111);
  doc.line(14, 113, 196, 113);
  doc.setFontSize(10);

  let y = 120;
  report.metrics.forEach((metric) => {
    doc.text(`${metric.key}: ${metric.value} ${metric.unit} | Faixa: ${metric.label} | Score: ${metric.score}`, 14, y);
    y += 6;
  });

  y += 3;
  doc.setFontSize(12);
  doc.text('Plano de Correção', 14, y);
  doc.line(14, y + 2, 196, y + 2);
  y += 9;
  doc.setFontSize(10);

  report.correctionPlan.forEach((item, idx) => {
    const wrapped = doc.splitTextToSize(`${idx + 1}. ${item}`, 178);
    doc.text(wrapped, 14, y);
    y += wrapped.length * 6 + 1;
  });

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8.5);
  doc.text('Documento de demonstração com processamento simulado a partir da amostra importada.', 14, 285);

  doc.save(`laudo-${sample.sampleCode || 'amostra'}-${Date.now()}.pdf`);
}

export function LabImport({ t }) {
  const {
    isDark,
    uploadPlan,
    uploadLimit,
    uploadsUsed,
    uploadsRemaining,
    uploadUsagePercent,
    registerSampleUploads,
    activateDemoPremiumPlan,
    activeDataSource,
  } = useLab();
  const im = t.portal.import;
  const C = useLabTheme();

  const [clients, setClients] = useState(mockClients);
  const [selectedClient, setSelectedClient] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [form, setForm] = useState(emptyClient);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentImportedSample, setCurrentImportedSample] = useState(null);
  const [processingResult, setProcessingResult] = useState(null);
  const [isReportReady, setIsReportReady] = useState(false);
  const fileInputRef = useRef(null);

  const isFreePlan = uploadPlan === 'FREE';
  const selectedClientData = clients.find(c => c.id === selectedClient);
  const uploadLimitMessage = `Você atingiu o limite de ${uploadLimit} uploads do plano gratuito. Faça upgrade para continuar.`;

  const sourceLabel = activeDataSource === 'real'
    ? 'Banco / Real'
    : activeDataSource === 'fallback'
      ? 'Mock (fallback)'
      : 'Demo / Mock';

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = `${im.fieldName} é obrigatório.`;
    if (!form.email.trim()) e.email = `${im.fieldEmail} é obrigatório.`;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido.';
    else if (clients.some(c => c.email === form.email)) e.email = 'Este email já está cadastrado.';
    return e;
  };

  const handleRegister = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => {
      const initials = form.name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
      const newClient = { id: `c-${Date.now()}`, ...form, phone: '', totalReports: 0, lastReport: '-', status: 'ativo', initials, reports: [] };
      setClients(prev => [...prev, newClient]);
      setSelectedClient(newClient.id);
      toast.success(`${im.fieldName} "${form.name}" cadastrado e selecionado!`);
      setShowModal(false); setForm(emptyClient); setErrors({}); setLoading(false);
    }, 600);
  };

  const handleNameChange = useCallback((e) => {
    const v = e.target.value;
    setForm(p => ({ ...p, name: v }));
    setErrors(p => ({ ...p, name: undefined }));
  }, []);

  const handleEmailChange = useCallback((e) => {
    const v = e.target.value;
    setForm(p => ({ ...p, email: v }));
    setErrors(p => ({ ...p, email: undefined }));
  }, []);

  const ensureClientSelected = useCallback(() => {
    if (selectedClient) return true;
    toast.error('Selecione um cliente antes de enviar arquivos de amostra.');
    return false;
  }, [selectedClient]);

  const buildProcessingFromFile = useCallback(async (file) => {
    setIsAnalyzing(true);
    try {
      const sample = await parseImportedSample({ file, selectedClientData });
      const report = calculateReport(sample);
      setCurrentImportedSample(sample);
      setProcessingResult(report);
      setIsReportReady(true);
      toast.success('Amostra processada. Pré-visualização do laudo liberada na própria tela de importação.');
    } catch {
      toast.error('Não foi possível processar a amostra.');
      setCurrentImportedSample(null);
      setProcessingResult(null);
      setIsReportReady(false);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedClientData]);

  const finishUpload = useCallback((files, blockedCount = 0) => {
    if (!files.length) return;

    setIsUploading(true);
    window.setTimeout(() => {
      registerSampleUploads(files.length);
      const batchId = Date.now();
      const uploadedAt = new Date().toISOString();

      setUploadedFiles(prev => ([
        ...files.map((file, index) => ({
          id: `${batchId}-${index}-${file.name}`,
          name: file.name,
          size: file.size,
          uploadedAt,
          file,
        })),
        ...prev,
      ].slice(0, 8)));

      const activeFile = files[files.length - 1];
      buildProcessingFromFile(activeFile);

      toast.success(`${files.length} arquivo(s) enviado(s) com sucesso para ${selectedClientData?.name || 'o cliente selecionado'}.`);

      if (blockedCount > 0) {
        toast.info(`${blockedCount} arquivo(s) não enviados. ${uploadLimitMessage}`);
        setShowPlanModal(true);
      }

      setIsUploading(false);
    }, 650);
  }, [registerSampleUploads, buildProcessingFromFile, selectedClientData?.name, uploadLimitMessage]);

  const handleFilesSelected = useCallback((fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    if (!ensureClientSelected()) return;

    if (!isFreePlan) {
      finishUpload(files);
      return;
    }

    if (uploadsRemaining <= 0) {
      toast.error(uploadLimitMessage);
      setShowPlanModal(true);
      return;
    }

    const allowedFiles = files.slice(0, uploadsRemaining);
    const blockedCount = Math.max(0, files.length - allowedFiles.length);

    if (!allowedFiles.length) {
      toast.error(uploadLimitMessage);
      setShowPlanModal(true);
      return;
    }

    finishUpload(allowedFiles, blockedCount);
  }, [ensureClientSelected, finishUpload, isFreePlan, uploadsRemaining, uploadLimitMessage]);

  const handleOpenPicker = useCallback(() => {
    if (isUploading) return;
    if (!ensureClientSelected()) return;
    fileInputRef.current?.click();
  }, [ensureClientSelected, isUploading]);

  const handleInputChange = useCallback((event) => {
    handleFilesSelected(event.target.files);
    event.target.value = '';
  }, [handleFilesSelected]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    handleFilesSelected(event.dataTransfer.files);
  }, [handleFilesSelected]);

  const handleRegenerateReport = () => {
    if (!currentImportedSample) {
      toast.error('Importe uma amostra antes de gerar o laudo.');
      return;
    }
    const report = calculateReport(currentImportedSample);
    setProcessingResult(report);
    setIsReportReady(true);
    toast.success('Laudo regenerado com base na amostra importada atual.');
  };

  const handleDownloadPdf = () => {
    if (!currentImportedSample || !processingResult || !isReportReady) {
      toast.error('Gere o laudo para baixar o PDF.');
      return;
    }

    generatePdf({
      sample: currentImportedSample,
      report: processingResult,
      sourceLabel,
    });

    toast.success('PDF gerado com sucesso.');
  };

  return (
    <div style={{ maxWidth: '200rem' }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Upload size={18} color="#10b981" />
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: C.text, margin: 0 }}>{im.cardTitle}</h3>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: '0.875rem', padding: '1rem', background: isDark ? '#111827' : '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: C.textMuted, marginBottom: '0.3rem' }}>Plano do laboratório</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: isFreePlan ? '#f59e0b' : '#10b981',
                    background: isFreePlan ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                    border: `1px solid ${isFreePlan ? 'rgba(245,158,11,0.35)' : 'rgba(16,185,129,0.35)'}`,
                  }}>
                    <Crown size={12} />
                    {uploadPlan}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 500, color: C.textMuted }}>
                    {isFreePlan ? 'Ideal para começar' : 'Uploads ilimitados'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPlanModal(true)}
                style={{
                  border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                  borderRadius: '0.5rem',
                  background: 'transparent',
                  color: C.text,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '0.45rem 0.8rem',
                  cursor: 'pointer',
                }}
              >
                Ver planos
              </button>
            </div>

            <div style={{ marginTop: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 600, color: C.text }}>
                <span>
                  {isFreePlan
                    ? `${uploadsUsed} de ${uploadLimit} uploads utilizados`
                    : `${uploadsUsed} uploads enviados nesta sessão`}
                </span>
                <span style={{ color: isFreePlan && uploadsRemaining === 0 ? '#f59e0b' : C.textMuted }}>
                  {isFreePlan ? `${uploadsRemaining} restantes` : 'Ilimitado'}
                </span>
              </div>
              <div style={{ marginTop: '0.45rem', height: '0.45rem', borderRadius: '999px', background: isDark ? '#1f2937' : '#e2e8f0', overflow: 'hidden' }}>
                <div style={{
                  width: isFreePlan ? `${uploadUsagePercent}%` : '100%',
                  height: '100%',
                  borderRadius: '999px',
                  background: isFreePlan && uploadsRemaining === 0
                    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                    : 'linear-gradient(90deg, #10b981, #34d399)',
                  transition: 'width 0.35s ease',
                }} />
              </div>
            </div>

            <div style={{
              marginTop: '0.75rem',
              borderRadius: '0.625rem',
              border: `1px solid ${isFreePlan && uploadsRemaining === 0 ? 'rgba(245,158,11,0.35)' : 'transparent'}`,
              background: isFreePlan && uploadsRemaining === 0 ? 'rgba(245,158,11,0.1)' : 'transparent',
              padding: isFreePlan && uploadsRemaining === 0 ? '0.55rem 0.65rem' : 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}>
              {isFreePlan && uploadsRemaining === 0 && <AlertTriangle size={14} color="#f59e0b" />}
              <p style={{ margin: 0, fontSize: '0.78rem', color: C.textMuted }}>
                {isFreePlan && uploadsRemaining === 0
                  ? uploadLimitMessage
                  : isFreePlan
                    ? `Você ainda pode enviar ${uploadsRemaining} arquivo(s) antes de precisar de upgrade.`
                    : 'Plano Premium ativo com uploads ilimitados.'}
              </p>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: C.label, marginBottom: '0.5rem' }}>{im.clientLabel}</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'stretch' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <select
                  value={selectedClient}
                  onChange={e => setSelectedClient(e.target.value)}
                  style={{
                    width: '100%',
                    border: `1px solid ${C.border}`,
                    borderRadius: '0.5rem',
                    padding: '0.5rem 2rem 0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    background: C.inputBg,
                    color: selectedClient ? C.text : C.textMuted,
                    appearance: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="" style={{ background: C.optionBg, color: C.textMuted }}>{im.clientPlaceholder}</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id} style={{ background: C.optionBg, color: C.text }}>
                      {c.name} — {c.email}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: C.textMuted, pointerEvents: 'none' }} />
              </div>
              <button
                onClick={() => { setForm(emptyClient); setErrors({}); setShowModal(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: isDark ? '#0d2b1f' : '#f0fdf4', color: '#10b981', border: `1px solid ${isDark ? '#134e2e' : '#bbf7d0'}`, borderRadius: '0.5rem', padding: '0.5rem 0.875rem', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', flexShrink: 0 }}
              >
                <UserPlus size={15} /> {im.registerClient}
              </button>
            </div>
          </div>

          <div
            onClick={handleOpenPicker}
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isFreePlan && uploadsRemaining === 0 ? '#f59e0b' : '#10b981'}`,
              borderRadius: '1.25rem',
              padding: '4rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: isDragging ? 'rgba(16,185,129,0.14)' : C.dropBg,
              cursor: isUploading ? 'wait' : 'pointer',
              transition: 'all 0.2s',
              opacity: isUploading ? 0.72 : 1,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleInputChange}
              style={{ display: 'none' }}
            />
            <div style={{ width: '4rem', height: '4rem', background: 'rgba(16,185,129,0.12)', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <UploadCloud size={32} color="#10b981" />
            </div>
            <h4 style={{ fontWeight: 700, fontSize: '1.0625rem', color: C.text, margin: '0 0 0.375rem' }}>
              {isUploading ? 'Processando upload...' : im.dragDrop}
            </h4>
            <p style={{ fontSize: '0.875rem', color: C.textMuted, margin: '0 0 1.25rem' }}>{im.orClick}</p>
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleOpenPicker();
              }}
              disabled={isUploading}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.625rem 2rem',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                width: '12rem',
                opacity: isUploading ? 0.7 : 1,
              }}
            >
              {im.selectFiles}
            </button>
            <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: C.textMuted, fontWeight: 500 }}>
              {selectedClientData
                ? `Uploads vinculados a ${selectedClientData.name} • ${im.featuresFooter}`
                : `Selecione um cliente para iniciar o envio • ${im.featuresFooter}`}
            </p>
          </div>

          {!!uploadedFiles.length && (
            <div style={{ border: `1px solid ${C.border}`, borderRadius: '0.875rem', overflow: 'hidden', background: C.surface }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={14} color="#10b981" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: C.text }}>Uploads recentes</span>
              </div>
              <div style={{ padding: '0.35rem 1rem' }}>
                {uploadedFiles.map(file => (
                  <div key={file.id} style={{ padding: '0.55rem 0', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                      <div style={{ fontSize: '0.72rem', color: C.textMuted }}>
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', padding: '0.2rem 0.5rem', borderRadius: '999px', flexShrink: 0 }}>
                      ENVIADO
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(isAnalyzing || currentImportedSample) && (
            <>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: '0.875rem', background: C.surface, padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.7rem' }}>
                  <TestTube2 size={16} color="#10b981" />
                  <h4 style={{ margin: 0, color: C.text, fontSize: '0.9rem', fontWeight: 700 }}>Amostra importada atual</h4>
                </div>

                {isAnalyzing && !currentImportedSample && (
                  <div style={{ fontSize: '0.82rem', color: C.textMuted }}>
                    Processando amostra importada e calculando resultados...
                  </div>
                )}

                {currentImportedSample && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    <InfoStat label="Arquivo" value={currentImportedSample.fileName} color={C.text} />
                    <InfoStat label="Código" value={currentImportedSample.sampleCode} color={C.text} />
                    <InfoStat label="Cliente" value={currentImportedSample.clientName} color={C.text} />
                    <InfoStat label="Talhão" value={currentImportedSample.fieldName} color={C.text} />
                    <InfoStat label="Tipo" value={currentImportedSample.analysisType} color={C.text} />
                    <InfoStat label="Importado em" value={formatDateTime(currentImportedSample.uploadedAt)} color={C.textMuted} />
                  </div>
                )}
              </div>

              {processingResult && (
                <div style={{ border: `1px solid ${C.border}`, borderRadius: '0.875rem', background: C.surface, padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
                    <Calculator size={16} color="#10b981" />
                    <h4 style={{ margin: 0, color: C.text, fontSize: '0.9rem', fontWeight: 700 }}>Resultado do processamento</h4>
                  </div>

                  <div style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: '0.75rem',
                    background: C.bgAlt,
                    padding: '0.85rem',
                    marginBottom: '0.75rem',
                  }}>
                    <div style={{ fontSize: '0.72rem', color: C.textMuted, fontWeight: 700 }}>ÍNDICE DE FERTILIDADE</div>
                    <div style={{ fontSize: '1.9rem', color: C.text, fontWeight: 900, lineHeight: 1.1 }}>{processingResult.fertilityScore}</div>
                    <div style={{ marginTop: '0.4rem', height: '0.5rem', borderRadius: '999px', background: C.barBg, overflow: 'hidden' }}>
                      <div style={{ width: `${processingResult.fertilityScore}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
                    </div>
                    <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: C.textMuted }}>
                      Qualidade: <strong style={{ color: C.text }}>{processingResult.qualityLabel}</strong> • Cultura recomendada: <strong style={{ color: '#10b981' }}>{processingResult.recommendedCrop}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))', gap: '0.65rem' }}>
                    {processingResult.metrics.map(metric => (
                      <div key={metric.key} style={{ border: `1px solid ${C.border}`, borderRadius: '0.65rem', padding: '0.6rem 0.7rem', background: C.bgAlt }}>
                        <div style={{ fontSize: '0.72rem', color: C.textMuted, fontWeight: 700 }}>{metric.key}</div>
                        <div style={{ marginTop: '0.2rem', fontSize: '0.96rem', color: C.text, fontWeight: 800 }}>
                          {metric.value} {metric.unit}
                        </div>
                        <div style={{
                          marginTop: '0.32rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          color: metric.tone,
                          background: `${metric.tone}20`,
                          border: `1px solid ${metric.tone}44`,
                          borderRadius: '9999px',
                          padding: '0.16rem 0.46rem',
                        }}>
                          {metric.label} • Score {metric.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {processingResult && (
                <div style={{ border: `1px solid ${C.border}`, borderRadius: '0.875rem', background: C.surface, padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
                    <ClipboardCheck size={16} color="#10b981" />
                    <h4 style={{ margin: 0, color: C.text, fontSize: '0.9rem', fontWeight: 700 }}>Pré-visualização do laudo</h4>
                  </div>

                  <div style={{
                    border: `1px solid rgba(16,185,129,0.35)`,
                    borderRadius: '0.75rem',
                    background: 'rgba(16,185,129,0.08)',
                    padding: '0.9rem',
                    marginBottom: '0.75rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.42rem', marginBottom: '0.35rem' }}>
                      <Sparkles size={14} color="#10b981" />
                      <span style={{ color: C.text, fontWeight: 800, fontSize: '0.82rem' }}>Laudo técnico pronto</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: C.textMuted, marginBottom: '0.5rem' }}>
                      Baseado na amostra <strong style={{ color: C.text }}>{currentImportedSample?.sampleCode}</strong> • Fonte: <strong style={{ color: C.text }}>{sourceLabel}</strong>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1rem', color: C.text, fontSize: '0.8rem', lineHeight: 1.55 }}>
                      {processingResult.correctionPlan.map((item, idx) => (
                        <li key={`${item}-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
                    <button onClick={handleRegenerateReport} style={primaryButtonStyle}>
                      <Calculator size={14} /> Gerar laudo
                    </button>
                    <button onClick={handleDownloadPdf} disabled={!isReportReady} style={secondaryButtonStyle(C, isReportReady)}>
                      <Download size={14} /> Baixar PDF
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={im.registerClientTitle} width="28rem">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <InputField
            label={`${im.fieldName} *`}
            placeholder="Ex. João Silva"
            value={form.name}
            onChange={handleNameChange}
            error={errors.name}
          />
          <InputField
            label={`${im.fieldEmail} *`}
            type="email"
            placeholder="Ex. joao@fazenda.com"
            value={form.email}
            onChange={handleEmailChange}
            error={errors.email}
          />
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={() => setShowModal(false)} style={{ padding: '0.5rem 1.25rem', border: `1px solid ${C.border}`, borderRadius: '0.5rem', background: C.surface, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: C.textMuted }}>{im.cancel}</button>
            <button onClick={handleRegister} disabled={loading}
              style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', background: loading ? '#a7f3d0' : '#10b981', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
              {loading ? im.registering : im.register}
            </button>
          </div>
        </div>
      </Modal>

      <PlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onSelectPlan={(planId) => {
          setShowPlanModal(false);
          if (planId === 'lab_premium') {
            activateDemoPremiumPlan();
            toast.success('Plano Premium selecionado. Fluxo de upgrade preparado para evolução com backend.');
            return;
          }
          toast.info('Você permaneceu no plano atual.');
        }}
        t={t}
        initialTab="laboratorio"
        contextTitle="Limite FREE atingido"
        contextMessage={uploadLimitMessage}
      />
    </div>
  );
}

function InfoStat({ label, value, color }) {
  return (
    <div style={{ border: '1px solid rgba(148,163,184,0.2)', borderRadius: '0.6rem', padding: '0.55rem 0.62rem' }}>
      <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: '0.2rem', fontSize: '0.8rem', color: color || '#e2e8f0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
}

const primaryButtonStyle = {
  border: 'none',
  borderRadius: '0.55rem',
  background: 'linear-gradient(135deg, #10b981, #059669)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.78rem',
  padding: '0.58rem 0.9rem',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
};

const secondaryButtonStyle = (C, enabled = true) => ({
  border: `1px solid ${C.border}`,
  borderRadius: '0.55rem',
  background: C.inputBg,
  color: C.text,
  fontWeight: 700,
  fontSize: '0.78rem',
  padding: '0.58rem 0.9rem',
  cursor: enabled ? 'pointer' : 'not-allowed',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  opacity: enabled ? 1 : 0.6,
});
