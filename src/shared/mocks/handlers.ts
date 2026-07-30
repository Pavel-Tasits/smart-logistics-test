import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@/shared/config';
import type {
  AuctionListRequest,
  ProblemDetail,
  SetBetRequest,
  ValidationProblem,
} from '@/shared/api/types';
import { BidRejectedError, ValidationRejectedError, store } from './db';

const url = (path: string) => `*${API_BASE_URL}${path}`;
const PROBLEM_JSON = { 'Content-Type': 'application/problem+json' };

function notFound() {
  return HttpResponse.json<ProblemDetail>(
    { code: 'resource_not_found', title: 'Не найдено', message: 'Аукцион не найден' },
    { status: 404, headers: PROBLEM_JSON },
  );
}

export const handlers = [
  http.post(url('/auctions/list'), async ({ request }) => {
    await delay(400);
    const body = (await request.json().catch(() => ({}))) as AuctionListRequest;
    return HttpResponse.json(store.list(body ?? {}));
  }),

  http.get(url('/auctions/:auctionUuid'), async ({ params }) => {
    await delay(350);
    const detail = store.getDetail(String(params.auctionUuid));
    return detail ? HttpResponse.json(detail) : notFound();
  }),

  http.get(url('/auctions/:auctionUuid/bets'), async ({ params, request }) => {
    await delay(300);
    const all = new URL(request.url).searchParams.get('all') === 'true';
    const bets = store.getBets(String(params.auctionUuid), all);
    return bets ? HttpResponse.json(bets) : notFound();
  }),

  http.post(url('/auctions/:auctionUuid/bets'), async ({ params, request }) => {
    await delay(500);
    const body = (await request.json()) as SetBetRequest;
    try {
      store.setBet(String(params.auctionUuid), body);
      // Upstream returns 200 with no body.
      return new HttpResponse(null, { status: 200 });
    } catch (error) {
      if (error instanceof ValidationRejectedError) {
        return HttpResponse.json<ValidationProblem>(
          {
            code: 'validation_failed',
            title: 'Ошибка валидации',
            message: 'Запрос содержит некорректные поля.',
            errors: error.errors,
          },
          { status: 422, headers: PROBLEM_JSON },
        );
      }
      if (error instanceof BidRejectedError) {
        const status = error.kind === 'not_found' ? 404 : 422;
        return HttpResponse.json<ProblemDetail>(
          { code: error.kind, title: 'Ставка отклонена', message: error.message },
          { status, headers: PROBLEM_JSON },
        );
      }
      throw error;
    }
  }),
];
