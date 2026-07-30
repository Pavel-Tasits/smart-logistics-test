import type {
  AuctionListItem,
  AuctionListItemTrading,
  AuctionListRequest,
  AuctionListResponseBase,
  AuctionShowResponse,
  AuctionStatus,
  BetItem,
  BetListResponse,
  SetBetRequest,
  TradingStatus,
  ValidationError,
} from '@/shared/api/types';
import { CURRENT_USER } from '@/shared/config';
import {
  bestFirst,
  calculateNextBidPrice,
  isCompetitiveAuction,
  validateBidPrice,
} from '@/shared/lib/trading';
import { AUCTION_STATUS_CODE } from '@/shared/lib/auction-status';
import { buildSeed } from './seed';

export interface AuctionRecord {
  detail: AuctionShowResponse;
  bets: BetItem[];
}

const FINISHED_STATUSES: AuctionStatus[] = ['Finished', 'DeterminateWinner'];

/** Narrow the 9-value trading status to the 6-value union used by the list DTO. */
function narrowListStatusMobile(
  status: TradingStatus | undefined,
): AuctionListItemTrading['status_mobile'] {
  switch (status) {
    case 'NotParticipating':
    case 'Leading':
    case 'Losing':
    case 'Winner':
    case 'Confirmed':
      return status;
    default:
      return 'Unknown';
  }
}

export class BidRejectedError extends Error {
  constructor(
    readonly kind: 'not_found' | 'bidding_closed',
    message: string,
  ) {
    super(message);
  }
}

export class ValidationRejectedError extends Error {
  constructor(readonly errors: ValidationError[]) {
    super('Validation failed');
  }
}

export class AuctionStore {
  private records = new Map<string, AuctionRecord>();

  constructor(seed: AuctionRecord[]) {
    for (const record of seed) {
      recompute(record);
      this.records.set(record.detail.main.order_uid ?? '', record);
    }
  }

  list(request: AuctionListRequest): AuctionListResponseBase {
    const page = request.page ?? 1;
    const perPage = request.per_page ?? 20;
    const filtered = [...this.records.values()]
      .map((r) => r.detail)
      .filter((detail) => matchesFilters(detail, request));

    sortDetails(filtered, request);

    const total = filtered.length;
    const start = (page - 1) * perPage;
    const pageItems = filtered.slice(start, start + perPage).map(deriveListItem);
    const lastPage = Math.max(1, Math.ceil(total / perPage));

    return {
      data: pageItems,
      meta: {
        current_page: page,
        per_page: perPage,
        total,
        last_page: lastPage,
        from: total === 0 ? 0 : start + 1,
        to: Math.min(start + perPage, total),
      },
    };
  }

  getDetail(uuid: string): AuctionShowResponse | null {
    return this.records.get(uuid)?.detail ?? null;
  }

  getBets(uuid: string, all: boolean): BetListResponse | null {
    const record = this.records.get(uuid);
    if (!record) return null;
    const bets = all ? record.bets : record.bets.filter((b) => !b.is_rejected);
    return { bets };
  }

  setBet(uuid: string, request: SetBetRequest): void {
    const record = this.records.get(uuid);
    if (!record) throw new BidRejectedError('not_found', 'Аукцион не найден');

    const { detail } = record;
    if (!detail.trading?.can_set_bet) {
      throw new BidRejectedError('bidding_closed', 'Ставки для этого аукциона закрыты');
    }

    const price = detail.trading.price ?? {};
    const errors = validateBidPrice(request.price, {
      min: price.min ?? null,
      max: price.max ?? null,
      step: price.step ?? null,
    });
    if (errors.length > 0) throw new ValidationRejectedError(errors);

    const now = new Date().toISOString();
    const withVat = round2(request.price);
    const noVat = round2(request.price / 1.2);
    const mine = record.bets.find(
      (b) => b.organization_id === CURRENT_USER.organizationId && !b.is_rejected,
    );

    if (mine) {
      mine.price_with_vat = withVat;
      mine.price_no_vat = noVat;
      mine.created_at = now;
    } else {
      record.bets.push({
        id: nextBetId(),
        created_at: now,
        auction_id: detail.main.id ?? 0,
        subscriber_id: CURRENT_USER.subscriberId,
        contact_name: 'Вы',
        contact_phone: '',
        price_with_vat: withVat,
        price_no_vat: noVat,
        organization_id: CURRENT_USER.organizationId,
        organization_inn: CURRENT_USER.inn,
        organization_name: CURRENT_USER.name,
        is_rejected: false,
        is_counter: false,
        place: null,
        is_win: false,
        run_number: 0,
        cancel_reason: '',
      });
    }

    recompute(record);
  }
}

// --- pure helpers -----------------------------------------------------------

function loadPoint(detail: AuctionShowResponse) {
  return (detail.routes ?? []).find((p) => p.op_type === 'Loading');
}
function unloadPoint(detail: AuctionShowResponse) {
  return [...(detail.routes ?? [])].reverse().find((p) => p.op_type === 'Unloading');
}

/** Detail trading has no `is_available`; derive it (available to bid = open auction). */
function isAvailable(detail: AuctionShowResponse): boolean {
  return (detail.trading?.can_set_bet ?? false) && detail.trading?.status === 'Auction';
}

function matchesFilters(
  detail: AuctionShowResponse,
  request: AuctionListRequest,
): boolean {
  const t = detail.trading ?? {};

  if (
    request.cargo_num &&
    !(detail.main.cargo_num ?? '').toLowerCase().includes(request.cargo_num.toLowerCase())
  ) {
    return false;
  }

  if (
    request.status?.length &&
    !request.status.includes((t.status_mobile ?? 'Unknown') as never)
  ) {
    return false;
  }

  if (request.statuses?.length) {
    const code = AUCTION_STATUS_CODE[(t.status ?? 'Unknown') as AuctionStatus];
    if (!request.statuses.includes(code)) return false;
  }

  if (
    request.auc_type?.length &&
    !request.auc_type.includes(detail.main.auc_type as never)
  ) {
    return false;
  }

  const load = loadPoint(detail);
  const unload = unloadPoint(detail);
  if (request.load_gc_id != null && load?.location?.city_gc_id !== request.load_gc_id) {
    return false;
  }
  if (
    request.unload_gc_id != null &&
    unload?.location?.city_gc_id !== request.unload_gc_id
  ) {
    return false;
  }

  const loadDate = (load?.start_date ?? '').slice(0, 10);
  if (
    request.load_date_from &&
    (!loadDate || loadDate < request.load_date_from.slice(0, 10))
  ) {
    return false;
  }
  if (
    request.load_date_to &&
    (!loadDate || loadDate > request.load_date_to.slice(0, 10))
  ) {
    return false;
  }

  if (request.is_available === true && !isAvailable(detail)) return false;
  if (request.is_bidder === true && !t.is_bidder) return false;

  const current = t.price?.current ?? null;
  if (
    request.current_price_from != null &&
    (current == null || current < request.current_price_from)
  ) {
    return false;
  }
  if (
    request.current_price_to != null &&
    (current == null || current > request.current_price_to)
  ) {
    return false;
  }

  return true;
}

function sortDetails(details: AuctionShowResponse[], request: AuctionListRequest): void {
  const sort = request.sort ?? null;
  const field = sort ? Object.keys(sort)[0] : 'start_time';
  const dir = sort ? sort[field] : request.is_oldest ? 'asc' : 'desc';
  const sign = dir === 'asc' ? 1 : -1;

  details.sort((a, b) => {
    let cmp = 0;
    if (field === 'current_price') {
      cmp = (a.trading?.price?.current ?? 0) - (b.trading?.price?.current ?? 0);
    } else if (field === 'price_per_km') {
      cmp = (a.trading?.price?.price_per_km ?? 0) - (b.trading?.price?.price_per_km ?? 0);
    } else {
      cmp = (a.trading?.start_time ?? '').localeCompare(b.trading?.start_time ?? '');
    }
    return cmp * sign;
  });
}

/** Recompute derived trading state after a mutation (ranks, current, your, status). */
export function recompute(record: AuctionRecord): void {
  const { detail, bets } = record;
  const trading = detail.trading;

  if (!trading) {
    return;
  }

  const auctionType = detail.main.auc_type ?? 'Unknown';
  const isCompetitive = isCompetitiveAuction(auctionType);
  const isFinished = FINISHED_STATUSES.includes(
    (trading.status ?? 'Unknown') as AuctionStatus,
  );

  const activeBets = bets.filter((bet) => !bet.is_rejected);

  if (isCompetitive) {
    const comparePrices = bestFirst(auctionType);

    activeBets.sort((firstBet, secondBet) =>
      comparePrices(firstBet.price_with_vat ?? 0, secondBet.price_with_vat ?? 0),
    );
  }

  activeBets.forEach((bet, index) => {
    bet.place = isCompetitive ? index + 1 : null;
    bet.is_win = isCompetitive && isFinished && index === 0;
  });

  for (const bet of bets) {
    if (!bet.is_rejected) {
      continue;
    }

    bet.place = null;
    bet.is_win = false;
  }

  const price = (trading.price ??= {});
  const bestBet = activeBets[0];

  if (bestBet) {
    price.current = bestBet.price_with_vat ?? price.current ?? null;

    price.current_no_vat = bestBet.price_no_vat ?? round2((price.current ?? 0) / 1.2);
  }

  price.available = calculateNextBidPrice(
    auctionType,
    price.current ?? null,
    price.step ?? null,
  );

  const currentUserBet = activeBets.find(
    (bet) => bet.organization_id === CURRENT_USER.organizationId,
  );

  const your = (trading.your ??= {});

  if (!currentUserBet) {
    your.bet = false;
    your.last_bet = null;
    your.last_bet_with_vat = null;
    your.win = false;

    trading.status_mobile = 'NotParticipating';
    trading.is_bidder = false;

    return;
  }

  your.bet = true;
  your.last_bet = currentUserBet.price_no_vat ?? null;
  your.last_bet_with_vat = currentUserBet.price_with_vat ?? null;
  your.win = currentUserBet.is_win ?? false;

  trading.is_bidder = true;

  if (!isCompetitive) {
    trading.status_mobile = 'Confirmed';
    return;
  }

  if (currentUserBet.place === 1) {
    trading.status_mobile = isFinished ? 'Winner' : 'Leading';

    return;
  }

  trading.status_mobile = 'Losing';
}

export function deriveListItem(detail: AuctionShowResponse): AuctionListItem {
  const main = detail.main;
  const t = detail.trading ?? {};
  const load = loadPoint(detail);
  const unload = unloadPoint(detail);
  const routeCargo = (detail.routes ?? []).find((p) => p.cargo)?.cargo;
  const cargo = detail.cargo ?? {};

  return {
    main: {
      id: main.id,
      cargo_num: main.cargo_num,
      cargo_date: main.cargo_date,
      auc_type: main.auc_type,
      order_uid: main.order_uid,
      created_at: main.created_at,
      priority_sort: 0,
      is_assembly: false,
      price_per_km: t.price?.price_per_km ?? null,
    },
    organizer: {
      subscriber_id: detail.organizer?.subscriber_id,
      organization_id: detail.organizer?.organization_id,
      organization_name: detail.organizer?.organization_name,
      organization_inn: detail.organizer?.organization_inn,
      organization_kpp: detail.organizer?.organization_kpp,
      is_hide_organization: false,
    },
    route: {
      load: {
        city: load?.location?.city_name,
        address: load?.location?.loading_address,
        date: load?.start_date,
        city_gc_id: load?.location?.city_gc_id,
        points_count: 1,
      },
      unload: {
        city: unload?.location?.city_name,
        address: unload?.location?.loading_address,
        date: unload?.start_date,
        city_gc_id: unload?.location?.city_gc_id,
        points_count: 1,
      },
    },
    cargo: {
      name: routeCargo?.name ?? '',
      weight: Number(routeCargo?.weight ?? 0),
      volume: Number(routeCargo?.volume ?? 0),
      body_type: cargo.body_type,
      truck_count: cargo.truck_count,
      is_cargo: true,
    },
    trading: {
      status: t.status,
      status_mobile: narrowListStatusMobile(t.status_mobile),
      start_time: t.start_time,
      stop_time: t.stop_time,
      bid_measurement_type: t.bid_measurement_type,
      can_set_bet: t.can_set_bet,
      allow_counter_bets: t.allow_counter_bets,
      hide_points_address_and_contacts: t.hide_points_address_and_contacts,
      is_bidder: t.is_bidder,
      is_available: isAvailable(detail),
      price: {
        start: t.price?.start ?? undefined,
        current: t.price?.current ?? undefined,
        current_no_vat: t.price?.current_no_vat ?? undefined,
      },
      your: {
        bet: t.your?.bet,
        last_bet: t.your?.last_bet ?? null,
      },
    },
    payment: {
      form: detail.payment?.form,
      currency_code: detail.payment?.currency_code,
    },
  };
}

// --- misc -------------------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

let betIdCounter = 100_000;
function nextBetId(): number {
  betIdCounter += 1;
  return betIdCounter;
}

/** Singleton store seeded once per page load. */
export const store = new AuctionStore(buildSeed());
