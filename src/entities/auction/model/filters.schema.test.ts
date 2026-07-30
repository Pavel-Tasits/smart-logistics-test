import { describe, expect, it } from 'vitest';
import {
  buildListRequest,
  countActiveFilters,
  parseAuctionsSearch,
} from './filters.schema';

describe('parseAuctionsSearch — safe fallbacks', () => {
  it('applies defaults for an empty object', () => {
    const result = parseAuctionsSearch({});
    expect(result.page).toBe(1);
    expect(result.per_page).toBe(20);
  });

  it('falls back to default page on invalid value instead of throwing', () => {
    expect(parseAuctionsSearch({ page: 'not-a-number' }).page).toBe(1);
  });

  it('clamps an out-of-range per_page back to the default', () => {
    expect(parseAuctionsSearch({ per_page: 9999 }).per_page).toBe(20);
  });

  it('drops an array with an invalid enum member (whole field falls back)', () => {
    const result = parseAuctionsSearch({ statuses: ['Auction', 'Nope'] });
    expect(result.statuses).toBeUndefined();
  });

  it('keeps valid enum arrays', () => {
    const result = parseAuctionsSearch({
      statuses: ['Auction', 'Finished'],
      auc_type: ['Down'],
    });
    expect(result.statuses).toEqual(['Auction', 'Finished']);
    expect(result.auc_type).toEqual(['Down']);
  });
});

describe('buildListRequest', () => {
  it('sends only pagination when no filters are set', () => {
    expect(buildListRequest(parseAuctionsSearch({ page: 2 }))).toEqual({
      page: 2,
      per_page: 20,
    });
  });

  it('maps auction statuses to their numeric codes', () => {
    const request = buildListRequest(
      parseAuctionsSearch({ statuses: ['Auction', 'Finished'] }),
    );
    expect(request.statuses).toEqual([2, 6]);
  });

  it('maps the remaining filters onto the request body', () => {
    const request = buildListRequest(
      parseAuctionsSearch({
        cargo_num: '00000001059',
        load_gc_id: 59,
        current_price_from: 1000,
        is_available: true,
        status: ['Leading'],
      }),
    );
    expect(request).toMatchObject({
      cargo_num: '00000001059',
      load_gc_id: 59,
      current_price_from: 1000,
      is_available: true,
      status: ['Leading'],
    });
  });

  it('includes sort only when both field and direction are set', () => {
    const request = buildListRequest(
      parseAuctionsSearch({ sort_field: 'current_price', sort_dir: 'asc' }),
    );
    expect(request.sort).toEqual({ current_price: 'asc' });
  });
});

describe('countActiveFilters', () => {
  it('counts only set filter fields', () => {
    const search = parseAuctionsSearch({ cargo_num: 'X', statuses: ['Auction'] });
    expect(countActiveFilters(search)).toBe(2);
  });

  it('is zero for a bare search', () => {
    expect(countActiveFilters(parseAuctionsSearch({}))).toBe(0);
  });
});
