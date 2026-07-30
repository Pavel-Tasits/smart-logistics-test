import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { auctionDetailQueryOptions } from '@/entities/auction';

/**
 * Returns a stable callback that prefetches an auction's detail query.
 * Attach it to a card's hover/focus to warm the cache before navigation.
 */
export function useAuctionPrefetch() {
  const queryClient = useQueryClient();
  return useCallback(
    (uuid: string) => {
      void queryClient.prefetchQuery(auctionDetailQueryOptions(uuid));
    },
    [queryClient],
  );
}
