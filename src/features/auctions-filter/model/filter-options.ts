import {
  AUCTION_STATUS_FILTER,
  AUCTION_STATUS_LABEL,
  AUCTION_TYPES,
  AUCTION_TYPE_LABEL,
  TRADING_STATUS_FILTER,
  TRADING_STATUS_LABEL,
} from '@/entities/auction';
import { CITIES } from '@/shared/mocks/cities';

export const cityOptions = CITIES.map(({ gcId, name }) => ({
  value: String(gcId),
  label: name,
}));

export const auctionTypeOptions = AUCTION_TYPES.map((type) => ({
  value: type,
  label: AUCTION_TYPE_LABEL[type],
}));

export const auctionStatusOptions = AUCTION_STATUS_FILTER.map((status) => ({
  value: status,
  label: AUCTION_STATUS_LABEL[status],
}));

export const tradingStatusOptions = TRADING_STATUS_FILTER.map((status) => ({
  value: status,
  label: TRADING_STATUS_LABEL[status],
}));

export const auctionTypeSet: ReadonlySet<string> = new Set(AUCTION_TYPES);

export const auctionStatusSet: ReadonlySet<string> = new Set(AUCTION_STATUS_FILTER);

export const tradingStatusSet: ReadonlySet<string> = new Set(TRADING_STATUS_FILTER);
