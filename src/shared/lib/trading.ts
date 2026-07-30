import type {AuctionType, CompetitiveAuctionType, ValidationError} from '@/shared/api/types';

export interface BetBounds {
  min: number | null;
  max: number | null;
  step: number | null;
}

/**
 * Reverse auctions: the lower the price, the better (carrier competes down).
 * Applies to Down and Request. Up goes higher; FixPrice has no competition.
 */
export function isReverseAuction(type: AuctionType): boolean {
  return type === 'Down' || type === 'Request';
}

/** Comparator that sorts bet prices best-first for the given auction type. */
export function bestFirst(
    type: CompetitiveAuctionType,
): (a: number, b: number) => number {
  return isReverseAuction(type)
      ? (a, b) => a - b
      : (a, b) => b - a;
}

/** Next price the user is allowed to bid, given the current price and step. */
export function calculateNextBidPrice(
    type: AuctionType,
    current: number | null,
    step: number | null,
): number | null | undefined {
  if (current == null || step == null) {
    return null;
  }

  switch (type) {
    case 'Down':
    case 'Request':
      return current - step;

    case 'Up':
      return current + step;

    case 'FixPrice':
      return null;
  }
}

function approximatelyEqual(a: number, b: number): boolean {
  return (
      Math.abs(a - b) <=
      Number.EPSILON * Math.max(1, Math.abs(a), Math.abs(b)) * 10
  );
}

function isAlignedToStep(price: number, base: number, step: number): boolean {
  const units = (price - base) / step;
  return approximatelyEqual(units, Math.round(units));
}

/**
 * Validate a proposed bid price against the trading bounds.
 * Pure function — returns contract-shaped validation errors (empty = valid).
 */
export function validateBidPrice(price: number, bounds: BetBounds): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Number.isFinite(price) || price <= 0) {
    errors.push({
      field: 'price',
      message: 'Цена должна быть больше 0',
      code: 'positive',
    });
    return errors;
  }

  if (bounds.min != null && price < bounds.min) {
    errors.push({
      field: 'price',
      message: `Цена не может быть ниже ${bounds.min}`,
      code: 'below_min',
    });
  }

  if (bounds.max != null && price > bounds.max) {
    errors.push({
      field: 'price',
      message: `Цена не может быть выше ${bounds.max}`,
      code: 'above_max',
    });
  }

  if (bounds.step != null && bounds.step > 0) {
    const base = bounds.min ?? 0;
    if (!isAlignedToStep(price, base, bounds.step)) {
      errors.push({
        field: 'price',
        message:
            bounds.min != null
                ? `Цена должна изменяться с шагом ${bounds.step}, начиная от ${bounds.min}`
                : `Цена должна быть кратна шагу ${bounds.step}`,
        code: 'not_aligned_to_step',
      });
    }
  }

  return errors;
}
