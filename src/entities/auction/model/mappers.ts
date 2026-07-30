import type {
  AuctionListItem,
  AuctionShowResponse,
  AuctionStatus,
  AuctionType,
  RoutePoint,
} from '@/shared/api/types';
import { currencyFromCode, type PrimaryAction } from './labels';
import type { AuctionDetailVM, AuctionListItemVM, RoutePointVM } from './view-models';

function toNumber(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Primary action for a card, derived from capabilities and state. */
export function derivePrimaryAction(
  canSetBet: boolean,
  hasMyBet: boolean,
  status: AuctionStatus,
): PrimaryAction {
  if (canSetBet) return hasMyBet ? 'ChangeBet' : 'SetBet';
  if (status === 'Canceled') return 'None';
  return 'ViewBets';
}

export function mapListItem(dto: AuctionListItem): AuctionListItemVM {
  const main = dto.main ?? {};
  const trading = dto.trading ?? {};
  const cargo = dto.cargo ?? {};
  const route = dto.route ?? {};
  const payment = dto.payment ?? {};

  const canSetBet = trading.can_set_bet ?? false;
  const hasMyBet = trading.your?.bet ?? false;
  const status = (trading.status ?? 'Unknown') as AuctionStatus;

  return {
    uuid: main.order_uid ?? '',
    id: main.id ?? null,
    cargoNum: main.cargo_num ?? '—',
    aucType: (main.auc_type ?? 'Unknown') as AuctionType,
    status,
    userStatus: trading.status_mobile ?? null,
    load: { city: route.load?.city ?? '—', date: route.load?.date ?? null },
    unload: { city: route.unload?.city ?? '—', date: route.unload?.date ?? null },
    cargo: {
      name: cargo.name ?? '—',
      weight: toNumber(cargo.weight),
      volume: toNumber(cargo.volume),
      bodyType: cargo.body_type ?? null,
    },
    currentPrice: trading.price?.current ?? null,
    pricePerKm: main.price_per_km ?? null,
    currency: currencyFromCode(payment.currency_code),
    hasMyBet,
    isAvailable: trading.is_available ?? false,
    canSetBet,
    primaryAction: derivePrimaryAction(canSetBet, hasMyBet, status),
  };
}

function mapRoutePoint(point: RoutePoint): RoutePointVM {
  const op = point.op_type ?? 'Unknown';
  return {
    kind: op === 'Loading' || op === 'Unloading' ? op : 'Unknown',
    city: point.location?.city_name ?? '—',
    address: point.location?.loading_address ?? null,
    startDate: point.start_date ?? null,
    endDate: point.end_date ?? null,
    contactName: point.contact?.name || null,
    contactPhone: point.contact?.phone || null,
  };
}

export function mapDetail(dto: AuctionShowResponse): AuctionDetailVM {
  const main = dto.main;
  const trading = dto.trading ?? {};
  const price = trading.price ?? {};
  const cargo = dto.cargo ?? {};
  const payment = dto.payment ?? {};
  const organizer = dto.organizer ?? {};
  const currency = currencyFromCode(payment.currency_code ?? cargo.currency);

  const noViewCargoPrice = trading.no_view_cargo_price ?? false;
  const routes = (dto.routes ?? []).map(mapRoutePoint);

  // Cargo name / weight / volume live on the route points' cargo in the detail DTO.
  const firstCargo = (dto.routes ?? []).find((p) => p.cargo)?.cargo;
  const cargoPriceNum = toNumber(cargo.price);

  return {
    uuid: main.order_uid ?? '',
    id: main.id ?? null,
    cargoNum: main.cargo_num ?? '—',
    aucType: (main.auc_type ?? 'Unknown') as AuctionType,
    status: (trading.status ?? 'Unknown') as AuctionStatus,
    userStatus: trading.status_mobile ?? null,
    currency,
    organizer: {
      name: organizer.organization_name ?? '—',
      inn: organizer.organization_inn ?? null,
      kpp: organizer.organization_kpp ?? null,
      hidden: false,
    },
    contacts: (dto.contacts ?? []).map((c) => ({
      name: c.name ?? null,
      phone: c.phone ?? null,
      email: c.email ?? null,
    })),
    route: routes,
    cargo: {
      name: firstCargo?.name ?? '—',
      bodyType: cargo.body_type ?? null,
      price:
        noViewCargoPrice || cargoPriceNum == null || cargoPriceNum === 0
          ? null
          : cargoPriceNum,
      distanceKm: cargo.distance ?? null,
      tempFrom: cargo.temp_from ?? null,
      tempTo: cargo.temp_to ?? null,
      isAdr: cargo.adr != null && cargo.adr !== 0,
      truckCount: cargo.truck_count ?? null,
      car: cargo.car ?? null,
    },
    payment: {
      form: payment.form ?? null,
      condition: payment.condition ?? null,
      delay: payment.delay ?? null,
      delayType: payment.delay_type ?? null,
      prepay: payment.prepay ?? null,
    },
    trading: {
      canSetBet: trading.can_set_bet ?? false,
      bidMeasurement: trading.bid_measurement_type ?? null,
      startTime: trading.start_time ?? null,
      stopTime: trading.stop_time ?? null,
      price: {
        start: price.start ?? null,
        current: price.current ?? null,
        currentNoVat: price.current_no_vat ?? null,
        available: price.available ?? null,
        min: price.min ?? null,
        max: price.max ?? null,
        step: price.step ?? null,
        pricePerKm: price.price_per_km ?? null,
      },
    },
    my: {
      hasBet: trading.your?.bet ?? false,
      lastBet: trading.your?.last_bet ?? null,
      lastBetWithVat: trading.your?.last_bet_with_vat ?? null,
      win: trading.your?.win ?? false,
    },
    restrictions: {
      canSetBet: trading.can_set_bet ?? false,
      hideBetsHistory: trading.hide_bets_history ?? false,
      hidePointsAddressAndContacts: trading.hide_points_address_and_contacts ?? false,
      noViewCargoPrice,
    },
  };
}
