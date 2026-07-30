import { describe, expect, it } from 'vitest';
import {
  bestFirst,
  isReverseAuction,
  validateBidPrice,
} from './trading';

describe('auction direction', () => {
  it('treats Down and Request as reverse (lower is better)', () => {
    expect(isReverseAuction('Down')).toBe(true);
    expect(isReverseAuction('Request')).toBe(true);
    expect(isReverseAuction('Up')).toBe(false);
    expect(isReverseAuction('FixPrice')).toBe(false);
  });

  it('sorts best-first per direction', () => {
    expect([3, 1, 2].sort(bestFirst('Down'))).toEqual([1, 2, 3]);
    expect([3, 1, 2].sort(bestFirst('Up'))).toEqual([3, 2, 1]);
  });
});

describe('validateBidPrice', () => {
  const bounds = { min: 20000, max: 30000, step: 500 };

  it('accepts a valid, aligned price', () => {
    expect(validateBidPrice(25000, bounds)).toEqual([]);
  });

  it('rejects a non-positive price', () => {
    expect(validateBidPrice(0, bounds)[0]?.code).toBe('positive');
  });

  it('rejects a price below the minimum', () => {
    expect(validateBidPrice(19000, bounds).some((e) => e.code === 'below_min')).toBe(
      true,
    );
  });

  it('rejects a price above the maximum', () => {
    expect(validateBidPrice(31000, bounds).some((e) => e.code === 'above_max')).toBe(
      true,
    );
  });

  it('rejects a price not aligned to the step', () => {
    expect(
      validateBidPrice(20250, bounds).some((e) => e.code === 'not_aligned_to_step'),
    ).toBe(true);
  });
});
