const CURRENCY_SYMBOL: Record<string, string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
};

/** Format a price with a currency symbol. Returns em dash for null/undefined. */
export function formatMoney(amount: number | null | undefined, currency = 'RUB'): string {
  if (amount == null) return '—';
  const formatted = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ${CURRENCY_SYMBOL[currency] ?? currency}`;
}

/** Format an ISO date (YYYY-MM-DD or date-time) as a localized short date. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/** Format an ISO date-time as a localized date + time. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatWeight(kg: number | null | undefined): string {
  if (kg == null) return '—';
  if (kg >= 1000) {
    return `${(kg / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} т`;
  }
  return `${kg.toLocaleString('ru-RU')} кг`;
}

export function formatVolume(m3: number | null | undefined): string {
  if (m3 == null) return '—';
  return `${m3.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} м³`;
}
