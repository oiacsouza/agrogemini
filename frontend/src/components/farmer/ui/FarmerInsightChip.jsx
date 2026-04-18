import React from 'react';

/**
 * FarmerInsightChip
 * Square card used in the "Key Insights" row (pH / Nutrients / Organic).
 *
 * @param {{ icon: React.ReactNode, label: string, value: string, sub: string, bg: string, textColor: string, subColor?: string }} props
 */
export function FarmerInsightChip({ icon, label, value, sub, bg, textColor, subColor = '#6b7280' }) {
  return (
    <div style={{
      background:    bg,
      borderRadius:  12,
      padding:       '12px 8px',
      textAlign:     'center',
      flex:          1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
        {icon}
      </div>
      <div style={{ fontSize: '0.7rem', color: subColor, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: textColor }}>{value}</div>
      <div style={{ fontSize: '0.65rem', color: textColor, marginTop: 2 }}>{sub}</div>
    </div>
  );
}
