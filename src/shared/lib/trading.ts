import type {
  AuctionType,
  CompetitiveAuctionType,
  ValidationError,
} from '@/shared/api/types';

export interface BetBounds {
  min: number | null;
  max: number | null;
  step: number | null;
}

export function isCompetitiveAuction(
    type: AuctionType,
): type is CompetitiveAuctionType {
  return type === 'Request' || type === 'Up' || type === 'Down';
}

export function isReverseAuction(
    type: AuctionType,
): type is Extract<CompetitiveAuctionType, 'Down' | 'Request'> {
  return type === 'Down' || type === 'Request';
}

/**
 * Возвращает компаратор для конкурентного аукциона:
 * лучшая ставка располагается первой.
 */
export function bestFirst(
    type: CompetitiveAuctionType,
): (a: number, b: number) => number {
  return isReverseAuction(type)
      ? (a, b) => a - b
      : (a, b) => b - a;
}

/**
 * Рассчитывает следующую доступную цену.
 * Для фиксированной или неизвестной модели торгов следующей цены нет.
 */
export function calculateNextBidPrice(
    type: AuctionType,
    current: number | null,
    step: number | null,
): number | null {
  if (
      current == null ||
      step == null ||
      !Number.isFinite(current) ||
      !Number.isFinite(step) ||
      step <= 0
  ) {
    return null;
  }

  switch (type) {
    case 'Down':
    case 'Request':
      return current - step;

    case 'Up':
      return current + step;

    case 'FixPrice':
    case 'Unknown':
      return null;
  }
}

function approximatelyEqual(a: number, b: number): boolean {
  return (
      Math.abs(a - b) <=
      Number.EPSILON *
      Math.max(1, Math.abs(a), Math.abs(b)) *
      10
  );
}

function isAlignedToStep(
    price: number,
    base: number,
    step: number,
): boolean {
  const units = (price - base) / step;

  return approximatelyEqual(units, Math.round(units));
}

export function validateBidPrice(
    price: number,
    bounds: BetBounds,
): ValidationError[] {
  if (!Number.isFinite(price) || price <= 0) {
    return [
      {
        field: 'price',
        message: 'Цена должна быть больше 0',
        code: 'positive',
      },
    ];
  }

  const errors: ValidationError[] = [];
  const { min, max, step } = bounds;

  if (min != null && price < min) {
    errors.push({
      field: 'price',
      message: `Цена не может быть ниже ${min}`,
      code: 'below_min',
    });
  }

  if (max != null && price > max) {
    errors.push({
      field: 'price',
      message: `Цена не может быть выше ${max}`,
      code: 'above_max',
    });
  }

  if (step != null && step > 0) {
    const base = min ?? 0;

    if (!isAlignedToStep(price, base, step)) {
      errors.push({
        field: 'price',
        message:
            min != null
                ? `Цена должна изменяться с шагом ${step}, начиная от ${min}`
                : `Цена должна быть кратна шагу ${step}`,
        code: 'not_aligned_to_step',
      });
    }
  }

  return errors;
}
