import type {
  AuctionStatus,
  AuctionType,
  BidMeasurementType,
  CarRequirements,
  PaymentDelayType,
  TradingStatus,
} from '@/shared/api/types';
import type { PrimaryAction } from './labels';

export interface RouteEndpointVM {
  city: string;
  date: string | null;
}

export interface AuctionListItemVM {
  /** order_uid — the identifier used by GET /auctions/{auctionUuid}. */
  uuid: string;
  id: number | null;
  cargoNum: string;
  aucType: AuctionType;
  status: AuctionStatus;
  userStatus: TradingStatus | null;
  load: RouteEndpointVM;
  unload: RouteEndpointVM;
  cargo: {
    name: string;
    weight: number | null;
    volume: number | null;
    bodyType: string | null;
  };
  currentPrice: number | null;
  pricePerKm: number | null;
  currency: string;
  hasMyBet: boolean;
  isAvailable: boolean;
  canSetBet: boolean;
  primaryAction: PrimaryAction;
}

export interface ContactVM {
  name: string | null;
  phone: string | null;
  email: string | null;
}

export interface RoutePointVM {
  kind: 'Loading' | 'Unloading' | 'Unknown';
  city: string;
  address: string | null;
  startDate: string | null;
  endDate: string | null;
  contactName: string | null;
  contactPhone: string | null;
}

export interface TradingPriceVM {
  start: number | null;
  current: number | null;
  currentNoVat: number | null;
  available: number | null;
  min: number | null;
  max: number | null;
  step: number | null;
  pricePerKm: number | null;
}

export interface MyBetVM {
  hasBet: boolean;
  lastBet: number | null;
  lastBetWithVat: number | null;
  win: boolean;
}

export interface AuctionRestrictionsVM {
  canSetBet: boolean;
  hideBetsHistory: boolean;
  hidePointsAddressAndContacts: boolean;
  noViewCargoPrice: boolean;
}

export interface AuctionDetailVM {
  uuid: string;
  id: number | null;
  cargoNum: string;
  aucType: AuctionType;
  status: AuctionStatus;
  userStatus: TradingStatus | null;
  currency: string;
  organizer: {
    name: string;
    inn: string | null;
    kpp: string | null;
    hidden: boolean;
  };
  contacts: ContactVM[];
  route: RoutePointVM[];
  cargo: {
    name: string;
    bodyType: string | null;
    /** Raw cargo price; null when hidden (no_view_cargo_price) or unset. */
    price: number | null;
    distanceKm: number | null;
    tempFrom: number | null;
    tempTo: number | null;
    isAdr: boolean;
    truckCount: number | null;
    car: CarRequirements;
  };
  payment: {
    form: string | null;
    condition: string | null;
    delay: number | null;
    delayType: PaymentDelayType;
    prepay: string | null;
  };
  trading: {
    canSetBet: boolean;
    bidMeasurement: BidMeasurementType | null;
    startTime: string | null;
    stopTime: string | null;
    price: TradingPriceVM;
  };
  my: MyBetVM;
  restrictions: AuctionRestrictionsVM;
}
