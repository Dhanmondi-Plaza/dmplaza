export function safeReturnTo(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f]/.test(value)) return null;
  try {
    const url = new URL(value, 'https://dm-plaza.invalid');
    if (url.origin !== 'https://dm-plaza.invalid' || url.pathname.startsWith('/account')) return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

export function normalizePhone(value: string): string | null {
  const compact = value.replace(/[\s().-]/g, '');
  if (/^\d{10}$/.test(compact)) return `+1${compact}`;
  if (/^1\d{10}$/.test(compact)) return `+${compact}`;
  return /^\+[1-9]\d{7,14}$/.test(compact) ? compact : null;
}
