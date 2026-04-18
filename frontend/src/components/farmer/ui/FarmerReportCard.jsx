import React from 'react';
import { Calendar, Clock, MapPin, Eye, Download, Pencil } from 'lucide-react';
import { FarmerStatusBadge } from './FarmerStatusBadge';
import { useFarmerTheme } from '../hooks/useFarmerTheme';

/**
 * FarmerReportCard
 * Individual report entry inside a farm group.
 *
 * @param {{ report: object, t: object, isDark: boolean, onView: () => void }} props
 */
export function FarmerReportCard({ report, t, isDark, onView }) {
  const fp = t.farmerPortal;
  const tk = useFarmerTheme(isDark);

  return (
    <div style={{
      background:   tk.cardBg,
      border:       `1.5px solid ${tk.cardBorder}`,
      borderRadius: 14,
      padding:      '14px 16px',
      marginBottom: 10,
      boxShadow:    tk.shadow,
    }}>
      {/* Title */}
      <p style={{ fontWeight: 700, fontSize: '0.95rem', color: tk.textPrimary, marginBottom: 8, margin: '0 0 8px' }}>
        {report.title}
      </p>

      {/* Date / Time row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8, flexWrap: 'wrap' }}>
        <Metadata icon={<Calendar size={12} />} label={report.date} tk={tk} />
        <Metadata icon={<Clock    size={12} />} label={report.time} tk={tk} />
      </div>

      {/* Field + badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <MapPin size={13} color={tk.textSecondary} />
        <span style={{ fontSize: '0.78rem', color: tk.textSecondary, fontWeight: 500 }}>
          {report.field}
        </span>
        <FarmerStatusBadge
          status={report.status}
          label={fp.status?.[report.status] ?? report.status}
          isDark={isDark}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', borderTop: `1px solid ${tk.divider}`, paddingTop: 10, gap: 8 }}>
        <button
          id={`fr-view-${report.id}`}
          onClick={onView}
          style={{
            flex:           1,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            6,
            background:     tk.greenLight,
            color:          tk.greenText,
            border:         `1.5px solid ${tk.greenBorder}`,
            borderRadius:   10,
            padding:        '9px 0',
            fontWeight:     600,
            fontSize:       '0.82rem',
            cursor:         'pointer',
          }}
        >
          <Eye size={14} /> {fp.visualize}
        </button>

        <IconBtn id={`fr-dl-${report.id}`}   icon={<Download size={15} />}  tk={tk} />
        <IconBtn id={`fr-edit-${report.id}`} icon={<Pencil   size={15} />}  tk={tk} />
      </div>
    </div>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────────

function Metadata({ icon, label, tk }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: tk.textSecondary }}>
      {icon} {label}
    </span>
  );
}

function IconBtn({ id, icon, tk }) {
  return (
    <button
      id={id}
      style={{
        padding:      '9px 12px',
        background:   tk.inputBg,
        border:       `1.5px solid ${tk.inputBorder}`,
        borderRadius: 10,
        cursor:       'pointer',
        display:      'flex',
        alignItems:   'center',
        color:        tk.textSecondary,
        lineHeight:   0,
      }}
    >
      {icon}
    </button>
  );
}
