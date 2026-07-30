export interface MockCity {
  gcId: number;
  name: string;
  fullName: string;
}

/** Mock cities dictionary — the single source used by the MSW seed and filter selects. */
export const CITIES: MockCity[] = [
  { gcId: 59, name: 'Пермь', fullName: 'Пермь, Россия' },
  { gcId: 77, name: 'Москва', fullName: 'Москва, Россия' },
  { gcId: 78, name: 'Санкт-Петербург', fullName: 'Санкт-Петербург, Россия' },
  { gcId: 52, name: 'Нижний Новгород', fullName: 'Нижний Новгород, Россия' },
  { gcId: 16, name: 'Казань', fullName: 'Казань, Россия' },
  { gcId: 66, name: 'Екатеринбург', fullName: 'Екатеринбург, Россия' },
  { gcId: 54, name: 'Новосибирск', fullName: 'Новосибирск, Россия' },
  { gcId: 61, name: 'Ростов-на-Дону', fullName: 'Ростов-на-Дону, Россия' },
  { gcId: 23, name: 'Краснодар', fullName: 'Краснодар, Россия' },
  { gcId: 63, name: 'Самара', fullName: 'Самара, Россия' },
];

const CITY_BY_ID = new Map(CITIES.map((c) => [c.gcId, c]));

export function getCity(gcId: number | null | undefined): MockCity | undefined {
  return gcId == null ? undefined : CITY_BY_ID.get(gcId);
}

export function getCityName(gcId: number | null | undefined): string {
  return getCity(gcId)?.name ?? '—';
}
