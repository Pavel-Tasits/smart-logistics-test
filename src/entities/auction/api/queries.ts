import { queryOptions, useQuery } from '@tanstack/react-query';
import type { AuctionListMeta, AuctionListRequest } from '@/shared/api/types';
import { getAuction, listAuctions } from './auction.api';
import { mapDetail, mapListItem } from '../model/mappers';
import type { AuctionDetailVM, AuctionListItemVM } from '../model/view-models';

export interface AuctionListVM {
  items: AuctionListItemVM[];
  meta: AuctionListMeta;
}

export const auctionKeys = {
  all: ['auctions'] as const,
  lists: () => [...auctionKeys.all, 'list'] as const,
  list: (request: AuctionListRequest) => [...auctionKeys.lists(), request] as const,
  details: () => [...auctionKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...auctionKeys.details(), uuid] as const,
};

export function auctionsListQueryOptions(request: AuctionListRequest) {
  return queryOptions({
    queryKey: auctionKeys.list(request),
    queryFn: async ({ signal }): Promise<AuctionListVM> => {
      const response = await listAuctions(request, signal);
      return {
        items: (response.data ?? []).map(mapListItem),
        meta: response.meta ?? {},
      };
    },
    placeholderData: (prev) => prev,
  });
}

export function auctionDetailQueryOptions(uuid: string) {
  return queryOptions({
    queryKey: auctionKeys.detail(uuid),
    queryFn: async ({ signal }): Promise<AuctionDetailVM> => {
      const response = await getAuction(uuid, signal);
      return mapDetail(response);
    },
    staleTime: 30_000,
  });
}

export function useAuctionsList(request: AuctionListRequest) {
  return useQuery(auctionsListQueryOptions(request));
}

export function useAuctionDetail(uuid: string) {
  return useQuery({
    ...auctionDetailQueryOptions(uuid),
    enabled: Boolean(uuid),
  });
}
