import {
    AUCTION_STATUS_FILTER,
    AUCTION_TYPES,
    TRADING_STATUS_FILTER,
    type AuctionsSearch,
} from '@/entities/auction';

type AuctionTypeFilter =
    NonNullable<AuctionsSearch['auc_type']>[number];

type AuctionStatusFilter =
    NonNullable<AuctionsSearch['statuses']>[number];

type TradingStatusFilter =
    NonNullable<AuctionsSearch['status']>[number];

const auctionTypeSet: ReadonlySet<string> = new Set(AUCTION_TYPES);

const auctionStatusSet: ReadonlySet<string> = new Set(
    AUCTION_STATUS_FILTER,
);

const tradingStatusSet: ReadonlySet<string> = new Set(
    TRADING_STATUS_FILTER,
);

function normalizeSelectedValues<T extends string>(
    values: string[],
    allowedValues: ReadonlySet<string>,
): T[] | undefined {
    const normalizedValues = values.filter(
        (value): value is T => allowedValues.has(value),
    );

    return normalizedValues.length > 0
        ? normalizedValues
        : undefined;
}

export function normalizeAuctionTypes(
    values: string[],
): AuctionsSearch['auc_type'] {
    return normalizeSelectedValues<AuctionTypeFilter>(
        values,
        auctionTypeSet,
    );
}

export function normalizeAuctionStatuses(
    values: string[],
): AuctionsSearch['statuses'] {
    return normalizeSelectedValues<AuctionStatusFilter>(
        values,
        auctionStatusSet,
    );
}

export function normalizeTradingStatuses(
    values: string[],
): AuctionsSearch['status'] {
    return normalizeSelectedValues<TradingStatusFilter>(
        values,
        tradingStatusSet,
    );
}

export function normalizeNumberInput(
    value: string | number,
): number | undefined {
    return typeof value === 'number' && Number.isFinite(value)
        ? value
        : undefined;
}

export function normalizeSelectNumber(
    value: string | null,
): number | undefined {
    if (value == null) {
        return undefined;
    }

    const parsedValue = Number(value);

    return Number.isFinite(parsedValue)
        ? parsedValue
        : undefined;
}
