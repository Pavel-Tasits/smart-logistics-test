import { formatMoney } from '@/shared/lib/format';

export function formatMoneyRange(
    min: number | null,
    max: number | null,
    currency: string,
): string {
    if (min != null && max != null) {
        return `${formatMoney(min, currency)} — ${formatMoney(max, currency)}`;
    }

    if (min != null) {
        return `от ${formatMoney(min, currency)}`;
    }

    if (max != null) {
        return `до ${formatMoney(max, currency)}`;
    }

    return '—';
}
