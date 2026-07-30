import { beforeEach, describe, expect, it } from 'vitest';
import {
  AuctionStore,
  BidRejectedError,
  ValidationRejectedError,
  deriveListItem,
} from './db';
import { buildSeed } from './seed';

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

describe('AuctionStore — derived state on seed', () => {
  const store = new AuctionStore(buildSeed());

  it('marks the user as leading when their bid is best (Down auction #0)', () => {
    const detail = store.getDetail(uuid(0))!;
    expect(detail.trading?.status_mobile).toBe('Leading');
    expect(detail.trading?.price?.current).toBe(27500);
    expect(detail.trading?.your?.bet).toBe(true);
  });

  it('deriveListItem reflects the recomputed trading state', () => {
    const item = deriveListItem(store.getDetail(uuid(0))!);
    expect(item.trading?.your?.bet).toBe(true);
    expect(item.trading?.price?.current).toBe(27500);
    expect(item.main?.order_uid).toBe(uuid(0));
  });
});

describe('AuctionStore.setBet — mutation updates state', () => {
  let store: AuctionStore;
  beforeEach(() => {
    store = new AuctionStore(buildSeed());
  });

  it('records a bet and recomputes current price + user status (#2)', () => {
    store.setBet(uuid(2), { price: 25800 });
    const detail = store.getDetail(uuid(2))!;
    expect(detail.trading?.price?.current).toBe(25800);
    expect(detail.trading?.your?.bet).toBe(true);
    expect(detail.trading?.status_mobile).toBe('Leading');

    const bets = store.getBets(uuid(2), true)!;
    expect(bets.bets.some((b) => b.organization_id === 14)).toBe(true);
  });

  it('throws a validation error for a price below the minimum (#2)', () => {
    expect(() => store.setBet(uuid(2), { price: 1000 })).toThrow(ValidationRejectedError);
  });

  it('throws when bidding is closed (Planning #9)', () => {
    expect(() => store.setBet(uuid(9), { price: 30000 })).toThrow(BidRejectedError);
  });
});
