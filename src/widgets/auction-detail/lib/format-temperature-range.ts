export function formatTemperatureRange(
    from: number | null,
    to: number | null,
): string {
    if (from != null && to != null) {
        return `${from}…${to} °C`;
    }

    if (from != null) {
        return `от ${from} °C`;
    }

    if (to != null) {
        return `до ${to} °C`;
    }

    return '—';
}
