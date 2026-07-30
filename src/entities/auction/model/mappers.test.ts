import { describe, expect, it } from 'vitest';
import { AuctionStore, deriveListItem } from '@/shared/mocks/db';
import { buildSeed } from '@/shared/mocks/seed';
import { mapDetail, mapListItem } from './mappers';

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const store = new AuctionStore(buildSeed());

describe('mapListItem', () => {
  it('flattens the nested list DTO into a view model', () => {
    const vm = mapListItem(deriveListItem(store.getDetail(uuid(0))!));
    expect(vm.uuid).toBe(uuid(0));
    expect(vm.aucType).toBe('Down');
    expect(vm.status).toBe('Auction');
    expect(vm.userStatus).toBe('Leading');
    expect(vm.hasMyBet).toBe(true);
    expect(vm.currentPrice).toBe(27500);
    expect(vm.currency).toBe('RUB');
    expect(vm.primaryAction).toBe('ChangeBet');
  });
});

describe('mapDetail', () => {
  it('maps trading, restrictions and price bounds', () => {
    const vm = mapDetail(store.getDetail(uuid(0))!);
    expect(vm.uuid).toBe(uuid(0));
    expect(vm.trading.price.current).toBe(27500);
    expect(vm.trading.canSetBet).toBe(true);
    expect(vm.my.hasBet).toBe(true);
    expect(vm.restrictions).toMatchObject({
      canSetBet: true,
      hideBetsHistory: false,
      hidePointsAddressAndContacts: false,
      noViewCargoPrice: false,
    });
  });

  it('hides the cargo price when no_view_cargo_price is set (#6)', () => {
    const vm = mapDetail(store.getDetail(uuid(6))!);
    expect(vm.restrictions.noViewCargoPrice).toBe(true);
    expect(vm.cargo.price).toBeNull();
  });
});
