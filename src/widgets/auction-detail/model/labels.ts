import type { AuctionDetailVM } from '@/entities/auction';

type DelayType = NonNullable<AuctionDetailVM['payment']['delayType']>;
type RoutePointKind = AuctionDetailVM['route'][number]['kind'];

export const DELAY_TYPE_LABEL = {
  CalendarDays: 'кал. дн.',
  WorkDays: 'раб. дн.',
  Unknown: '',
} satisfies Record<DelayType, string>;

export function getRoutePointKindLabel(kind: RoutePointKind): string {
  switch (kind) {
    case 'Loading':
      return 'Погрузка';

    case 'Unloading':
      return 'Выгрузка';

    default:
      return 'Точка';
  }
}
