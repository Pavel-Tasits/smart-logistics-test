import type { AuctionStatus } from '@/shared/api/types';

/**
 * Auction status → numeric code (per the OpenAPI schema doc).
 * Single source of truth shared by the list filter (client) and the mock server.
 */
export const AUCTION_STATUS_CODE: Record<AuctionStatus, number> = {
  Planning: 1,
  Auction: 2,
  DeterminateWinner: 3,
  WaitDeal: 4,
  InProgress: 5,
  Finished: 6,
  Stopped: 7,
  Canceled: 8,
  Unknown: 0,
};
