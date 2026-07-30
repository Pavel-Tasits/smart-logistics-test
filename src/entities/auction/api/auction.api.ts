import { apiRequest } from '@/shared/api/http';
import type {
  AuctionListRequest,
  AuctionListResponseBase,
  AuctionShowResponse,
} from '@/shared/api/types';

export function listAuctions(
  request: AuctionListRequest,
  signal?: AbortSignal,
): Promise<AuctionListResponseBase> {
  return apiRequest<AuctionListResponseBase>('/auctions/list', {
    method: 'POST',
    body: request,
    signal,
  });
}

export function getAuction(
  uuid: string,
  signal?: AbortSignal,
): Promise<AuctionShowResponse> {
  return apiRequest<AuctionShowResponse>(`/auctions/${uuid}`, { signal });
}
