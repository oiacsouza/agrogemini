import React from 'react';
import { useLabTheme } from '../lab/useLabTheme'; // This file will work as a bridge for any inputs needing Lab styling or can receive tokens.

export function InputField({ label, type = 'text', placeholder, value, onChange, error }) {
  // If useLabTheme throws error because used outside context, we can just optionally pass theme or try-catch.
  // Actually, LabImport and LabEmployees are safely inside LabProvider.
  const C = useLabTheme();
  
  const inputStyle = {
    width: '100%',
    border: `1px solid ${error ? '#f87171' : C.border}`,
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    outline: 'none',
    background: C.inputBg,
    color: C.text,
    boxSizing: 'border-box',
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: C.label, marginBottom: '0.375rem' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        style={inputStyle}
      />
      {error && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  );
}
