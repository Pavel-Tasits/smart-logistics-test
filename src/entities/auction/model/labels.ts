import type { AuctionStatus, AuctionType, TradingStatus } from '@/shared/api/types';

export const AUCTION_TYPE_LABEL: Record<AuctionType, string> = {
  Request: 'Заявочный',
  Up: 'На повышение',
  Down: 'На понижение',
  FixPrice: 'Фикс. цена',
  Unknown: 'Неизвестный',
};

export const AUCTION_STATUS_LABEL: Record<AuctionStatus, string> = {
  Planning: 'Планирование',
  Auction: 'Идут торги',
  DeterminateWinner: 'Определение победителя',
  WaitDeal: 'Ожидание сделки',
  InProgress: 'В работе',
  Finished: 'Завершён',
  Stopped: 'Остановлен',
  Canceled: 'Отменён',
  Unknown: 'Неизвестный',
};

/** Mantine Badge color per auction status. */
export const AUCTION_STATUS_COLOR: Record<AuctionStatus, string> = {
  Planning: 'gray',
  Auction: 'green',
  DeterminateWinner: 'teal',
  WaitDeal: 'cyan',
  InProgress: 'indigo',
  Finished: 'blue',
  Stopped: 'orange',
  Canceled: 'red',
  Unknown: 'gray',
};

/** User trading status (trading.status_mobile). */
export const TRADING_STATUS_LABEL: Record<TradingStatus, string> = {
  NotParticipating: 'Не участвуете',
  Leading: 'Вы лидируете',
  Losing: 'Вас перебили',
  OnPending: 'На рассмотрении',
  Confirmed: 'Подтверждена',
  ChoosingWinner: 'Выбор победителя',
  Winner: 'Вы победитель',
  Accepted: 'Принята',
  Unknown: 'Неизвестный',
};

export const TRADING_STATUS_COLOR: Record<TradingStatus, string> = {
  NotParticipating: 'gray',
  Leading: 'green',
  Losing: 'yellow',
  OnPending: 'cyan',
  Confirmed: 'teal',
  ChoosingWinner: 'indigo',
  Winner: 'green',
  Accepted: 'blue',
  Unknown: 'gray',
};

/** VM-level primary action for a card. */
export type PrimaryAction = 'SetBet' | 'ChangeBet' | 'ViewBets' | 'None';

export const PRIMARY_ACTION_LABEL: Record<PrimaryAction, string> = {
  SetBet: 'Сделать ставку',
  ChangeBet: 'Изменить ставку',
  ViewBets: 'Посмотреть ставки',
  None: 'Недоступно',
};

/** ISO 4217 numeric currency code → ISO alpha code used by the formatter. */
export function currencyFromCode(code: string | number | null | undefined): string {
  const map: Record<string, string> = { '643': 'RUB', '840': 'USD', '978': 'EUR' };
  return map[String(code ?? '')] ?? 'RUB';
}
