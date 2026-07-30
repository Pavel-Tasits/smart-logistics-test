# Грузовые аукционы — SPA

SPA для работы с грузовыми аукционами по OpenAPI-схеме `openapi.auctions.v0.json`
(схема — источник правды). Бэкенд не пишется: все запросы обслуживает MSW,
моки соответствуют контракту и реально меняют состояние после установки ставки.

## Стек

- **React 19 + TypeScript + Vite**
- **TanStack Router** — типобезопасный роутинг (code-based)
- **TanStack Query** — загрузка/кеш/инвалидация серверных данных
- **React Hook Form + Zod** — форма ставки и валидация search-параметров
- **MSW** — стейтовые моки по OpenAPI-контракту
- **MobX** — точечный клиентский UI-state (панель фильтров на мобиле)
- **Mantine** — UI-кит
- **Feature-Sliced Design** — архитектура слоёв

## Запуск

```bash
npm install
npm run dev          # http://localhost:5173
```

Прочие команды:

```bash
npm run build        # tsc -b + vite build
npm run test         # unit-тесты (vitest)
npm run typecheck    # проверка типов
npm run gen:api      # регенерация типов из openapi.auctions.v0.json
```

Типы API сгенерированы в `src/shared/api/schema.gen.ts` из схемы через
`openapi-typescript`. При изменении схемы — `npm run gen:api`.

## Маршруты

| Путь                         | Экран                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `/auctions`                  | Список аукционов. Фильтры и пагинация синхронизированы в URL search params (Zod-валидация с безопасными fallback). |
| `/auctions/$auctionUuid`     | Детальная страница + вкладка «Ставки».                                                                             |
| `/auctions/$auctionUuid/bet` | Форма ставки — модалка поверх детальной. **Открывается по прямой ссылке.**                                         |

`$auctionUuid` — это `main.order_uid` из схемы.

## Архитектура (FSD)

```
src/
  app/        роутер, провайдеры (Mantine, Query, MSW bootstrap)
  pages/      auctions, auction-detail (+ bet modal)
  widgets/    auctions-list, auction-detail, bets-list
  features/   auctions-filter, place-bet, prefetch-auction
  entities/   auction, bet (api, queries, ViewModels, мапперы, zod-схемы)
  shared/     api (client/типы/ошибки), config, lib, stores (MobX), mocks (MSW)
```

### Ключевое архитектурное решение — слой ViewModel

Реальная схема «шумная»: вложенные группы (`main/organizer/trading/…`), строковые
числа, разнесённые поля (например, вес/объём груза лежат в точках маршрута).
Чтобы UI не зависел от формы DTO, введён слой **ViewModel** и мапперы
`DTO → VM` (`entities/*/model/mappers.ts`). Контракты наружу (запросы, ответы,
enum-значения, ошибки) остаются строго по схеме; вся «нормализация» — в мапперах.

## Соответствие контракту

- **Endpoints:** `POST /auctions/list`, `GET /auctions/{uuid}`,
  `GET /auctions/{uuid}/bets?all=`, `POST /auctions/{uuid}/bets`. Base — `/api/v1`.
- **Пагинация:** `page/per_page` в запросе, `meta.{current_page,last_page,total}` в ответе.
- **Enum'ы:** статус аукциона (`Planning…Canceled`), торговый статус пользователя
  (`status_mobile`), тип аукциона — из схемы.
- **Фильтры → тело запроса:** `cargo_num`, `status` (торговый статус, строки),
  `statuses` (статус аукциона → числовые коды), `auc_type[]`,
  `load_gc_id/unload_gc_id`, `load_date_from/to`, `is_available`, `is_bidder`,
  `current_price_from/to`, `sort`.
- **Ограничения detail:** `can_set_bet`, `hide_bets_history`,
  `hide_points_address_and_contacts`, `no_view_cargo_price`.
- **Ошибки:** `application/problem+json` — `ProblemDetail` (404/409) и
  `ValidationProblem` (422, `errors[].{field,message,code}`).
- **Установка ставки:** `POST {price}` → 200 без тела; после успеха
  инвалидируются `list/detail/bets`, MSW-стор пересчитывает текущую цену,
  торговый статус и список ставок.

## Что проверялось

Способ проверки: unit-тесты на чистую логику + ручная проверка сценариев в браузере

- typecheck + production build.

**Автотесты (`npm run test`, 37 шт.):**

- парсинг search-параметров и безопасные fallback (`filters.schema.test.ts`);
- сборка тела запроса `AuctionListRequest`, маппинг статусов в числовые коды;
- ViewModel-мапперы `mapListItem` / `mapDetail` (`mappers.test.ts`);
- логика торгов и валидация ставки min/max/step (`trading.test.ts`);
- zod-схема формы ставки (`bet-form.schema.test.ts`);
- стейтовость MSW-стора: `setBet` меняет цену/статус/ставки, валидация и закрытые
  торги бросают ошибки (`db.test.ts`);
- маппинг ошибки 422 `problem+json` → `ApiError` (`error.test.ts`).

**Ручные сценарии (dev-режим, MSW включён):**

- список: загрузка/skeleton/паг. переход, prefetch детальной по hover;
- фильтры: изменение → синхронизация в URL, перезагрузка страницы восстанавливает
  состояние, «Сбросить»; порча search params в URL не роняет страницу (fallback);
- edge cases в моках: пустой список ставок, скрытая история (`hide_bets_history`),
  скрытая цена груза, скрытые адреса/контакты, отменённая ставка с причиной,
  завершённый аукцион с победителем, `can_set_bet=false` (disabled);
- ставка: валидация (>0, min/max/step), успех → тост + обновление цены/статуса,
  ошибка 422 → тост + ошибка на поле; форма открывается по прямой ссылке
  `/auctions/$uuid/bet`;
- адаптив: desktop/mobile (фильтры сворачиваются в панель через MobX-store).

## Ограничения и допущения

- `openapi.auctions.v0.json` в репозитории — предоставленная реальная схема.
- Реальная схема детали не содержит `is_available` в `trading` — в моках оно
  выводится как «открытый аукцион, доступный для ставки».
- Ответ `POST /bets` по схеме без тела — клиент делает refetch (не читает ответ).
- Данные и идентичность текущего пользователя (`CURRENT_USER`) фиксированы в
  моках (`src/shared/config`, `src/shared/mocks/seed.ts`).
- Города — из мок-словаря `src/shared/mocks/cities.ts` (`city_gc_id`).
