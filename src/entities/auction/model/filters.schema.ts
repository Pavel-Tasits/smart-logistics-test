import { z } from 'zod';
import type { AuctionListRequest } from '@/shared/api/types';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/shared/config';
import { AUCTION_STATUS_CODE } from '@/shared/lib/auction-status';

/** Auction statuses exposed in the filter (excludes the fallback `Unknown`). */
export const AUCTION_STATUS_FILTER = [
  'Planning',
  'Auction',
  'DeterminateWinner',
  'WaitDeal',
  'InProgress',
  'Finished',
  'Stopped',
  'Canceled',
] as const;

/** User trading statuses (trading.status_mobile) exposed in the filter. */
export const TRADING_STATUS_FILTER = [
  'NotParticipating',
  'Leading',
  'Losing',
  'OnPending',
  'Confirmed',
  'ChoosingWinner',
  'Winner',
  'Accepted',
] as const;

export const AUCTION_TYPES = ['Request', 'Up', 'Down', 'FixPrice'] as const;

const auctionStatusEnum = z.enum(AUCTION_STATUS_FILTER);
const tradingStatusEnum = z.enum(TRADING_STATUS_FILTER);
const aucTypeEnum = z.enum(AUCTION_TYPES);
const sortFieldEnum = z.enum(['start_time', 'price_per_km', 'current_price']);
const sortDirEnum = z.enum(['asc', 'desc']);

/**
 * Zod schema for the auctions-list URL search params.
 * Every field uses `.catch(...)` so a malformed URL never throws — invalid
 * values fall back to a safe default and the rest of the params are preserved.
 */
export const auctionsSearchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(DEFAULT_PAGE),
  per_page: z.coerce.number().int().min(1).max(100).catch(DEFAULT_PER_PAGE),

  cargo_num: z.string().trim().min(1).optional().catch(undefined),
  // task "status" → schema `status` (user trading statuses)
  status: z.array(tradingStatusEnum).optional().catch(undefined),
  // task "statuses" → schema `statuses` (auction statuses, sent as numbers)
  statuses: z.array(auctionStatusEnum).optional().catch(undefined),
  auc_type: z.array(aucTypeEnum).optional().catch(undefined),
  load_gc_id: z.coerce.number().int().optional().catch(undefined),
  unload_gc_id: z.coerce.number().int().optional().catch(undefined),
  load_date_from: z.string().date().optional().catch(undefined),
  load_date_to: z.string().date().optional().catch(undefined),
  is_available: z.boolean().optional().catch(undefined),
  is_bidder: z.boolean().optional().catch(undefined),
  current_price_from: z.coerce.number().min(0).optional().catch(undefined),
  current_price_to: z.coerce.number().min(0).optional().catch(undefined),

  sort_field: sortFieldEnum.optional().catch(undefined),
  sort_dir: sortDirEnum.optional().catch(undefined),
});

export type AuctionsSearch = z.infer<typeof auctionsSearchSchema>;

export function parseAuctionsSearch(input: unknown): AuctionsSearch {
  return auctionsSearchSchema.parse(input);
}

/** Map validated search params into the POST /auctions/list request body. */
export function buildListRequest(search: AuctionsSearch): AuctionListRequest {
  const request: AuctionListRequest = {
    page: search.page,
    per_page: search.per_page,
  };

  if (search.cargo_num) request.cargo_num = search.cargo_num;
  if (search.status?.length) request.status = [...search.status];
  if (search.statuses?.length) {
    request.statuses = search.statuses.map((s) => AUCTION_STATUS_CODE[s]);
  }
  if (search.auc_type?.length) request.auc_type = [...search.auc_type];
  if (search.load_gc_id != null) request.load_gc_id = search.load_gc_id;
  if (search.unload_gc_id != null) request.unload_gc_id = search.unload_gc_id;
  if (search.load_date_from) request.load_date_from = search.load_date_from;
  if (search.load_date_to) request.load_date_to = search.load_date_to;
  if (search.is_available != null) request.is_available = search.is_available;
  if (search.is_bidder != null) request.is_bidder = search.is_bidder;
  if (search.current_price_from != null) {
    request.current_price_from = search.current_price_from;
  }
  if (search.current_price_to != null) {
    request.current_price_to = search.current_price_to;
  }
  if (search.sort_field && search.sort_dir) {
    request.sort = { [search.sort_field]: search.sort_dir };
  }

  return request;
}

/** Count of active filters — handy for a reset affordance / badge. */
export function countActiveFilters(search: AuctionsSearch): number {
  const keys: Array<keyof AuctionsSearch> = [
    'cargo_num',
    'status',
    'statuses',
    'auc_type',
    'load_gc_id',
    'unload_gc_id',
    'load_date_from',
    'load_date_to',
    'is_available',
    'is_bidder',
    'current_price_from',
    'current_price_to',
  ];
  return keys.filter((key) => {
    const value = search[key];
    if (Array.isArray(value)) return value.length > 0;
    return value != null;
  }).length;
}
