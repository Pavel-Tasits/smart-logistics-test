import type {
  AuctionShowResponse,
  AuctionStatus,
  AuctionType,
  BetItem,
  RoutePoint,
} from '@/shared/api/types';
import { CURRENT_USER } from '@/shared/config';
import type { AuctionRecord } from './db';

const au = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const pad = (n: number) => String(n).padStart(2, '0');
const round2 = (n: number) => Math.round(n * 100) / 100;

interface Carrier {
  organization_id: number;
  organization_inn: string;
  organization_name: string;
  subscriber_id: number;
  contact_name: string;
  contact_phone: string;
}

const CARRIERS: Carrier[] = [
  {
    organization_id: 21,
    organization_inn: '5905123456',
    organization_name: 'ООО ТрансЛайн',
    subscriber_id: 101,
    contact_name: 'Петров П.П.',
    contact_phone: '+79001112201',
  },
  {
    organization_id: 22,
    organization_inn: '7728654321',
    organization_name: 'ИП Кузнецов А.В.',
    subscriber_id: 102,
    contact_name: 'Кузнецов А.В.',
    contact_phone: '+79001112202',
  },
  {
    organization_id: 23,
    organization_inn: '1650987654',
    organization_name: 'ООО ГрузАвто',
    subscriber_id: 103,
    contact_name: 'Сидоров С.С.',
    contact_phone: '+79001112203',
  },
];

const ME: Carrier = {
  organization_id: CURRENT_USER.organizationId,
  organization_inn: CURRENT_USER.inn,
  organization_name: CURRENT_USER.name,
  subscriber_id: CURRENT_USER.subscriberId,
  contact_name: 'Вы',
  contact_phone: '',
};

const CARGO_NAMES = [
  'Мороженое',
  'Стройматериалы',
  'Бытовая техника',
  'Автозапчасти',
  'Текстиль',
  'Металлопрокат',
];
const BODY_TYPES = [
  'тентованный',
  'рефрижератор',
  'изотермический',
  'фургон',
  'бортовой',
];
const ORGANIZERS = [
  {
    subscriber_id: 98,
    subscriber_code: '12345',
    infobase_code: 'RU_Cargo_01',
    organization_name: 'ЛИМ',
    organization_inn: '7703769184',
    organization_kpp: '770301001',
    organization_id: 340,
  },
  {
    subscriber_id: 76,
    subscriber_code: '54321',
    infobase_code: 'RU_Cargo_02',
    organization_name: 'АО ПродСеть',
    organization_inn: '7809876543',
    organization_kpp: '780901001',
    organization_id: 330,
  },
];
const CITY_PAIRS: Array<[number, number]> = [
  [59, 77],
  [78, 66],
  [52, 16],
  [23, 77],
  [54, 66],
  [61, 63],
  [63, 16],
  [77, 52],
];
const CITY_NAME: Record<number, string> = {
  59: 'Пермь',
  77: 'Москва',
  78: 'Санкт-Петербург',
  52: 'Нижний Новгород',
  16: 'Казань',
  66: 'Екатеринбург',
  54: 'Новосибирск',
  61: 'Ростов-на-Дону',
  23: 'Краснодар',
  63: 'Самара',
};

interface BetSpec {
  carrier: Carrier;
  price: number; // with VAT
  rejected?: boolean;
  cancelReason?: string;
  counter?: boolean;
}

interface AuctionSpec {
  index: number;
  type?: AuctionType;
  status?: AuctionStatus;
  canSetBet?: boolean;
  bets?: BetSpec[];
  hideBetsHistory?: boolean;
  hidePointsAndContacts?: boolean;
  noViewCargoPrice?: boolean;
}

function makeRoutePoint(
  op: 'Loading' | 'Unloading',
  row: number,
  gcId: number,
  date: string,
  cargoName: string,
  weight: number,
  volume: number,
  hide: boolean,
): RoutePoint {
  return {
    row_num: row,
    op_type: op,
    start_date: `${date}T09:00:00`,
    end_date: `${date}T18:00:00`,
    comment: null,
    contractor: '',
    contractor_inn: '',
    location: {
      city_name: CITY_NAME[gcId],
      city_full_name: `${CITY_NAME[gcId]}, Россия`,
      city_gc_id: gcId,
      loading_address: hide ? '' : `${CITY_NAME[gcId]}, Транспортная 9`,
      lon: 56.238,
      lat: 58.01,
    },
    cargo: {
      name: cargoName,
      package_name: '',
      weight: weight.toFixed(3),
      volume: volume.toFixed(3),
      length: '0',
      width: '0',
      height: '0',
      oversized: false,
      package_amount: null,
    },
    contact: hide
      ? { name: '', phone: '' }
      : { name: 'Иванов Иван', phone: '+79001234567' },
  };
}

function makeBets(index: number, specs: BetSpec[]): BetItem[] {
  return specs.map((spec, i) => ({
    id: index * 100 + i + 1,
    created_at: `2026-05-25T16:${pad(i * 3)}:00`,
    auction_id: 1000 + index,
    subscriber_id: spec.carrier.subscriber_id,
    contact_name: spec.carrier.contact_name,
    contact_phone: spec.carrier.contact_phone,
    price_with_vat: spec.price,
    price_no_vat: round2(spec.price / 1.2),
    organization_id: spec.carrier.organization_id,
    organization_inn: spec.carrier.organization_inn,
    organization_name: spec.carrier.organization_name,
    transporter_comment: null,
    is_rejected: spec.rejected ?? false,
    is_counter: spec.counter ?? false,
    place: null,
    is_win: false,
    run_number: 0,
    cancel_reason: spec.cancelReason ?? '',
  }));
}

function makeAuction(spec: AuctionSpec): AuctionRecord {
  const { index } = spec;
  const type = spec.type ?? (['Down', 'Up', 'Request', 'FixPrice'] as const)[index % 4];
  const status = spec.status ?? 'Auction';
  const [loadGc, unloadGc] = CITY_PAIRS[index % CITY_PAIRS.length];
  const org = ORGANIZERS[index % ORGANIZERS.length];
  const bodyType = BODY_TYPES[index % BODY_TYPES.length];
  const cargoName = CARGO_NAMES[index % CARGO_NAMES.length];
  const canSet = spec.canSetBet ?? status === 'Auction';
  const hide = spec.hidePointsAndContacts ?? false;

  const reverse = type === 'Down' || type === 'Request';
  const base = 30_000 + index * 1_500;
  const step = type === 'FixPrice' ? null : 500;
  const min = type === 'FixPrice' ? base : reverse ? Math.round(base * 0.6) : base;
  const max = type === 'FixPrice' ? base : reverse ? base : Math.round(base * 1.6);
  const weight = 1 + (index % 20);
  const volume = 10 + (index % 8) * 4;
  const distance = 500 + index * 50;

  const loadDate = `2026-08-${pad(3 + (index % 20))}`;
  const unloadDate = `2026-08-${pad(5 + (index % 20))}`;

  const detail: AuctionShowResponse = {
    main: {
      id: 1000 + index,
      cargo_num: String(1_000_000 + index).padStart(11, '0'),
      cargo_date: '2026-05-04T14:49:09',
      order_uid: au(index),
      auc_type: type,
      created_at: `2026-05-${pad(1 + (index % 27))}T11:48:20`,
    },
    organizer: { ...org },
    contacts: hide
      ? []
      : [
          {
            name: 'Иванов Иван Иванович',
            phone: '+79001234567',
            work_phone: null,
            uid: au(1000 + index),
            email: 'ivanov@example.com',
          },
        ],
    cargo: {
      price: String(base * 3),
      currency: 643,
      is_international: false,
      distance,
      truck_count: 1,
      body_type: bodyType,
      temp_from: bodyType === 'рефрижератор' ? -18 : null,
      temp_to: bodyType === 'рефрижератор' ? -5 : null,
      conics: null,
      belts: null,
      adr: index % 7 === 0 ? 3 : null,
      coupling: null,
      air_pass: null,
      low_loader: null,
      additional_load: null,
      containered: false,
      container_type: null,
      container_size: null,
      loading_types: { side: true, top: false, rear: true, full: false },
      docs: { tir: false, cmr: false, t1: false, med: false },
      car:
        index % 3 === 0
          ? {
              type: 'Тягач',
              weight: 20,
              volume: 82,
              width: 2.4,
              length: 13.6,
              height: 2.7,
            }
          : null,
    },
    trading: {
      status,
      status_mobile: 'NotParticipating',
      start_time: '2026-05-25T16:03:00',
      stop_time: '2026-05-25T18:18:00',
      bid_measurement_type: 'PerRoute',
      can_set_bet: canSet,
      allow_counter_bets: true,
      hide_bets_history: spec.hideBetsHistory ?? false,
      hide_places: false,
      no_view_cargo_price: spec.noViewCargoPrice ?? false,
      hide_points_address_and_contacts: hide,
      is_bidder: false,
      is_favorite: false,
      is_last_bet_with_vat: null,
      red_bet_with_vat: false,
      red_bet_no_vat: false,
      send_deal_before_load: false,
      chat_id: null,
      price: {
        start: base,
        start_no_vat: round2(base / 1.2),
        current: base,
        current_no_vat: round2(base / 1.2),
        available: null,
        available_no_vat: null,
        min,
        min_no_vat: round2(min / 1.2),
        max,
        max_no_vat: round2(max / 1.2),
        step,
        step_no_vat: step != null ? round2(step / 1.2) : null,
        price_per_km: round2(base / distance),
      },
      your: { bet: false, last_bet: null, last_bet_with_vat: null, win: false },
      settings: {
        prolong_after_bet: 10,
        winner_confirm: 1,
        winner_counter_mode: null,
        transmission_time_in: 24,
        coefficient: 10,
      },
    },
    payment: {
      condition: 'По оригиналам накладных (ТН, ТТН, CMR)',
      condition_predefined: 'ПоОригиналамНакладных',
      form: index % 2 === 0 ? 'Безналичная с НДС' : 'Безналичная без НДС',
      delay: index % 3 === 0 ? 30 : null,
      delay_type: index % 3 === 0 ? 'CalendarDays' : null,
      currency_code: '643',
      prepay: '0',
    },
    assembly: { num: null, date: null },
    routes: [
      makeRoutePoint('Loading', 1, loadGc, loadDate, cargoName, weight, volume, hide),
      makeRoutePoint(
        'Unloading',
        2,
        unloadGc,
        unloadDate,
        cargoName,
        weight,
        volume,
        hide,
      ),
    ],
    admitted_organizations: [],
    hide_bets_history: spec.hideBetsHistory ?? false,
  };

  return { detail, bets: makeBets(index, spec.bets ?? []) };
}

/** Deterministic dataset: hand-crafted edge cases first, then fillers for pagination. */
export function buildSeed(): AuctionRecord[] {
  const specs: AuctionSpec[] = [
    // 0: Down — I'm leading (lowest bid is mine)
    {
      index: 0,
      type: 'Down',
      status: 'Auction',
      bets: [
        { carrier: CARRIERS[0], price: 29_000 },
        { carrier: ME, price: 27_500 },
        { carrier: CARRIERS[1], price: 28_000 },
      ],
    },
    // 1: Up — I'm losing (someone bid higher)
    {
      index: 1,
      type: 'Up',
      status: 'Auction',
      bets: [
        { carrier: ME, price: 33_000 },
        { carrier: CARRIERS[2], price: 35_000 },
      ],
    },
    // 2: Request — no bets yet (empty state)
    { index: 2, type: 'Request', status: 'Auction', bets: [] },
    // 3: Finished — I won
    {
      index: 3,
      type: 'Down',
      status: 'Finished',
      canSetBet: false,
      bets: [
        { carrier: CARRIERS[0], price: 40_000 },
        { carrier: ME, price: 38_500 },
      ],
    },
    // 4: Finished — someone else won (I lost)
    {
      index: 4,
      type: 'Down',
      status: 'Finished',
      canSetBet: false,
      bets: [
        { carrier: CARRIERS[2], price: 36_000 },
        { carrier: ME, price: 37_000 },
      ],
    },
    // 5: history hidden
    {
      index: 5,
      type: 'Up',
      status: 'Auction',
      hideBetsHistory: true,
      bets: [{ carrier: CARRIERS[1], price: 41_000 }],
    },
    // 6: cargo price hidden + addresses/contacts hidden
    {
      index: 6,
      type: 'Request',
      status: 'Auction',
      noViewCargoPrice: true,
      hidePointsAndContacts: true,
      bets: [{ carrier: CARRIERS[0], price: 42_000 }],
    },
    // 7: canceled (rejected) bet with reason
    {
      index: 7,
      type: 'Down',
      status: 'Auction',
      bets: [
        { carrier: CARRIERS[0], price: 44_000 },
        {
          carrier: CARRIERS[1],
          price: 30_000,
          rejected: true,
          cancelReason: 'Отозвана перевозчиком',
        },
      ],
    },
    // 8: FixPrice
    { index: 8, type: 'FixPrice', status: 'Auction', bets: [] },
    // 9: Planning — bidding not open
    { index: 9, type: 'Down', status: 'Planning', canSetBet: false, bets: [] },
    // 10: Stopped
    { index: 10, type: 'Up', status: 'Stopped', canSetBet: false, bets: [] },
    // 11: Canceled
    { index: 11, type: 'Down', status: 'Canceled', canSetBet: false, bets: [] },
  ];

  for (let i = 12; i < 26; i += 1) {
    specs.push({
      index: i,
      status: 'Auction',
      bets:
        i % 3 === 0
          ? [
              { carrier: CARRIERS[i % CARRIERS.length], price: 30_000 + i * 900 },
              { carrier: CARRIERS[(i + 1) % CARRIERS.length], price: 30_000 + i * 800 },
            ]
          : [],
    });
  }

  return specs.map(makeAuction);
}
