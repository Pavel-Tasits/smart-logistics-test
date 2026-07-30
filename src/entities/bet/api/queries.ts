import { queryOptions, useQuery } from '@tanstack/react-query';
import { listBets } from './bet.api';

export const betKeys = {
  all: ['bets'] as const,
  list: (uuid: string, all: boolean) => [...betKeys.all, uuid, { all }] as const,
};

export function betsQueryOptions(uuid: string, all = false) {
  return queryOptions({
    queryKey: betKeys.list(uuid, all),
    queryFn: ({ signal }) => listBets(uuid, all, signal),
  });
}

export function useBets(uuid: string, all = false) {
  return useQuery(betsQueryOptions(uuid, all));
}
