import { describe, expect, it } from 'vitest';
import { createBetFormSchema, suggestBetPrice } from './bet-form.schema';

const bounds = { min: 20000, max: 30000, step: 500 };
const schema = createBetFormSchema(bounds);

describe('createBetFormSchema', () => {
  it('accepts a valid aligned price', () => {
    expect(schema.safeParse({ price: 25000 }).success).toBe(true);
  });

  it('rejects a non-positive price', () => {
    expect(schema.safeParse({ price: 0 }).success).toBe(false);
  });

  it('rejects a price below the minimum', () => {
    expect(schema.safeParse({ price: 19000 }).success).toBe(false);
  });

  it('rejects a price above the maximum', () => {
    expect(schema.safeParse({ price: 31000 }).success).toBe(false);
  });

  it('rejects a price not aligned to the step', () => {
    expect(schema.safeParse({ price: 20250 }).success).toBe(false);
  });

  it('surfaces the message on the price field', () => {
    const result = schema.safeParse({ price: 19000 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['price']);
    }
  });
});

describe('suggestBetPrice', () => {
  it('prefers available, then current, then min', () => {
    expect(suggestBetPrice({ available: 29000, current: 30000, min: 20000 })).toBe(29000);
    expect(suggestBetPrice({ available: null, current: 30000, min: 20000 })).toBe(30000);
    expect(suggestBetPrice({ available: null, current: null, min: 20000 })).toBe(20000);
  });
});
