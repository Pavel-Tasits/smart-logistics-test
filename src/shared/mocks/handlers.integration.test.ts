import { setupServer } from 'msw/node';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/api/error';
import { mapDetail, mapListItem } from '@/entities/auction';
import type {
  AuctionListResponseBase,
  AuctionShowResponse,
  BetListResponse,
} from '@/shared/api/types';
import { handlers } from './handlers';

const BASE = 'http://localhost/api/v1';
const UUID = '00000000-0000-4000-8000-000000000002'; // Request auction, open, no seed bets

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

async function post(path: string, body: unknown) {
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('HTTP contract — full flow over MSW', () => {
  it('lists auctions and maps them to view models', async () => {
    const res = await post('/auctions/list', { page: 1, per_page: 20 });
    expect(res.status).toBe(200);
    const body = (await res.json()) as AuctionListResponseBase;
    expect(body.data?.length).toBeGreaterThan(0);
    expect(body.meta?.total).toBeGreaterThan(0);

    const vm = mapListItem(body.data![0]);
    expect(vm.uuid).toBeTruthy();
    expect(vm.currency).toBe('RUB');
  });

  it('rejects an invalid bid with a 422 validation problem', async () => {
    const res = await post(`/auctions/${UUID}/bets`, { price: 1000 });
    expect(res.status).toBe(422);
    const error = new ApiError(res.status, await res.json());
    expect(error.isValidationError).toBe(true);
    expect(error.validation?.errors[0]?.field).toBe('price');
  });

  it('accepts a valid bid (200, no body) and reflects it in detail + bets', async () => {
    const res = await post(`/auctions/${UUID}/bets`, { price: 25800 });
    expect(res.status).toBe(200);

    const detailRes = await fetch(`${BASE}/auctions/${UUID}`);
    const detail = mapDetail((await detailRes.json()) as AuctionShowResponse);
    expect(detail.trading.price.current).toBe(25800);
    expect(detail.my.hasBet).toBe(true);

    const betsRes = await fetch(`${BASE}/auctions/${UUID}/bets?all=true`);
    const bets = (await betsRes.json()) as BetListResponse;
    expect(bets.bets.some((b) => b.organization_id === 14)).toBe(true);
  });

  it('returns a 404 problem for an unknown auction', async () => {
    const res = await fetch(`${BASE}/auctions/does-not-exist`);
    expect(res.status).toBe(404);
    const error = new ApiError(res.status, await res.json());
    expect(error.isValidationError).toBe(false);
    expect(error.displayMessage).toBeTruthy();
  });
});
