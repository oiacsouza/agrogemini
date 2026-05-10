import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';
import { useLab } from '../context/LabContext';
import { useLabTheme } from './lab/useLabTheme';
import { dashboardService } from '../services/api';

export function LabSampleDetail({ t }) {
  const { isDark, activeLab } = useLab();
  const C = useLabTheme();
  
  const [nutrientData, setNutrientData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    async function loadData() {
      if (!activeLab?.id) return;
      try {
        // Initialize with empty arrays to be populated by API
        setNutrientData([]);
        setTrendData([]);
      } catch (err) {
        console.error('Error loading detail data:', err);
      }
    }
    loadData();
  }, [activeLab]);

  const cardStyle = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '2rem', marginBottom: '1.5rem' };
  const tooltipStyle = { background: C.tooltipBg, border: `1px solid ${C.tooltipBorder}`, borderRadius: '0.5rem', color: C.text };

  return (
    <div>
      {/* Nutrient Chart */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <BarChart3 size={20} color="#10b981" />
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: C.text, margin: 0 }}>{t.portal.detail.nutrientAnalysis}</h3>
        </div>
        <div style={{ height: '20rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {nutrientData.length > 0 ? (
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
          ) : (
            <span style={{ color: C.textMuted, fontSize: '0.875rem' }}>Dados de nutrientes ainda não disponíveis para esta unidade.</span>
          )}
        </div>
      </div>

      {/* Trend Chart */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <TrendingUp size={20} color="#10b981" />
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: C.text, margin: 0 }}>{t.portal.detail.processingTrends}</h3>
        </div>
        <div style={{ height: '20rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.gridStroke} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: C.textMuted, fontSize: 12 }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: C.textMuted, fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: C.textMuted, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold', color: C.textMuted }} />
                <Line yAxisId="left" type="monotone" dataKey="samples" name={t.portal.detail.samplesLine} stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 7 }} />
                <Line yAxisId="right" type="monotone" dataKey="health" name={t.portal.dashboard.avgHealth} stroke={C.lineHealth} strokeWidth={3} dot={{ r: 5, fill: C.lineHealth, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <span style={{ color: C.textMuted, fontSize: '0.875rem' }}>Dados históricos ainda não processados.</span>
          )}
        </div>
      </div>
    </div>
  );
}
