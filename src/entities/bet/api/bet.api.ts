import { apiRequest } from '@/shared/api/http';
import type { BetListResponse, SetBetRequest } from '@/shared/api/types';

export function listBets(
  uuid: string,
  all = false,
  signal?: AbortSignal,
): Promise<BetListResponse> {
  const query = all ? '?all=true' : '';
  return apiRequest<BetListResponse>(`/auctions/${uuid}/bets${query}`, { signal });
}

/** POST a bet. The API returns 200 with no body (proxied from upstream). */
export function setBet(uuid: string, request: SetBetRequest): Promise<void> {
  return apiRequest<void>(`/auctions/${uuid}/bets`, {
    method: 'POST',
    body: request,
  });
}
