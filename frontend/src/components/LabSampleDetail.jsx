import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, ArrowLeft, FileText, Calendar, User, MapPin } from 'lucide-react';
import { useLab } from '../context/LabContext';
import { useLabTheme } from './lab/useLabTheme';
import { amostraService, laudoService } from '../services/api';
import { Badge } from './ui/Badge';

export function LabSampleDetail({ t, sampleId, onBack }) {
  const { isDark, activeLab } = useLab();
  const C = useLabTheme();
  
  const [sample, setSample] = useState(null);
  const [laudo, setLaudo] = useState(null);
  const [results, setResults] = useState([]);
  const [nutrientData, setNutrientData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!sampleId) return;
      setLoading(true);
      try {
        const s = await amostraService.getById(sampleId);
        setSample(s);
        
        try {
          const l = await laudoService.getByAmostra(sampleId);
          if (l) {
            setLaudo(l);
            const res = await laudoService.getResultados(l.id);
            setResults(res);
            
            // Map results to chart data
            const mapped = res.map(r => ({
              name: r.parametro,
              current: Number(r.valor) || 0,
              optimal: 80 // Dummy optimal value for comparison
            }));
            setNutrientData(mapped);
          }
        } catch (err) {
          console.log('No laudo found for this sample yet.');
        }
      } catch (err) {
        console.error('Error loading detail data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sampleId]);

  const cardStyle = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '1.5rem', marginBottom: '1.5rem' };
  const tooltipStyle = { background: C.tooltipBg, border: `1px solid ${C.tooltipBorder}`, borderRadius: '0.5rem', color: C.text };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: C.textMuted }}>Carregando detalhes...</div>;
  }

  if (!sample) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: C.textMuted }}>Amostra não encontrada.</p>
        <button onClick={onBack} style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Voltar</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#10b981', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> {t.common?.back || 'Voltar'}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Info Sidebar */}
        <div>
          <div style={cardStyle}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: C.text, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="#10b981" /> Detalhes da Amostra
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: C.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>Status</div>
                <div style={{ marginTop: '0.25rem' }}><Badge type={sample.status?.toLowerCase()} t={t} /></div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: C.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>Código Interno</div>
                <div style={{ fontSize: '0.9rem', color: C.text, fontWeight: 600 }}>{sample.codigo_interno || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: C.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>Data de Entrada</div>
                <div style={{ fontSize: '0.9rem', color: C.text, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={14} /> {new Date(sample.data_entrada).toLocaleDateString('pt-BR')}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: C.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>Tipo de Amostra</div>
                <div style={{ fontSize: '0.9rem', color: C.text }}>{sample.tipo_amostra}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Results */}
        <div style={{ minWidth: 0 }}>
          {nutrientData.length > 0 ? (
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <BarChart3 size={20} color="#10b981" />
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: C.text, margin: 0 }}>{t.portal.detail.nutrientAnalysis}</h3>
              </div>
              <div style={{ height: '20rem', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={nutrientData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.gridStroke} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: C.textMuted, fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: C.textMuted, fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={tooltipStyle} />
                    <Legend iconType="square" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold', color: C.textMuted }} />
                    <Bar dataKey="current" name={t.portal.detail.currentLevel} fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="optimal" name={t.portal.detail.optimalLevel} fill={isDark ? '#1e3a5f' : '#dbeafe'} radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div style={cardStyle}>
              <p style={{ color: C.textMuted, textAlign: 'center', margin: '2rem 0' }}>Nenhum laudo ou resultado disponível para esta amostra ainda.</p>
            </div>
          )}

          {results.length > 0 && (
            <div style={cardStyle}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: C.text, marginBottom: '1.25rem' }}>Tabela de Resultados</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}`, textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: C.textMuted }}>Parâmetro</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: C.textMuted }}>Valor</th>
                    <th style={{ padding: '0.75rem', fontSize: '0.75rem', color: C.textMuted }}>Unidade</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>{r.parametro}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{r.valor}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: C.textMuted }}>{r.unidade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
