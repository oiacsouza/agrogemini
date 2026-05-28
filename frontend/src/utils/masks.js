/**
 * Input Masks Utility — AgroGemini
 * 
 * Provides pure-JS mask functions for Brazilian document formats.
 * Each mask function receives a raw string and returns the formatted version.
 * Each "unmasked" companion strips non-digit chars for API submission.
 */

// ─── CPF: 000.000.000-00 ──────────────────────────────────────────
export function maskCPF(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// ─── CNPJ: 00.000.000/0001-00 ─────────────────────────────────────
export function maskCNPJ(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

// ─── CEP: 00000-000 ───────────────────────────────────────────────
export function maskCEP(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2');
}

// ─── Phone: (00) 00000-0000 or (00) 0000-0000 ────────────────────
export function maskPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    // Landline: (00) 0000-0000
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  // Mobile: (00) 00000-0000
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

// ─── State (UF): 2 uppercase letters ─────────────────────────────
export function maskUF(value) {
  return value
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 2)
    .toUpperCase();
}

// ─── Numbers only ─────────────────────────────────────────────────
export function maskOnlyNumbers(value) {
  return value.replace(/\D/g, '');
}

// ─── Letters only (names) ─────────────────────────────────────────
export function maskOnlyLetters(value) {
  return value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '');
}

// ─── Unmasked helpers (strip non-digits) ──────────────────────────
export function unmask(value) {
  return (value || '').replace(/\D/g, '');
}

// ─── Wrapper: creates an onChange handler with mask ────────────────
export function maskedOnChange(setter, maskFn) {
  return (e) => {
    const raw = e.target.value;
    setter(maskFn(raw));
  };
}

// ─── maxLength constraint for free-text fields ────────────────────
export function maskMaxLength(value, max) {
  return value.slice(0, max);
}
