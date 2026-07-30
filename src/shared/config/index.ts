/** Base URL for the (mocked) API. Matches the `servers` entry in the OpenAPI schema. */
export const API_BASE_URL = '/api/v1';

/** Default pagination for the auctions list. */
export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 20;
export const PER_PAGE_OPTIONS = [10, 20, 50] as const;

/**
 * Whether the app should boot the MSW mock server.
 * Enabled by default; set `VITE_USE_MOCKS=false` to run against a real backend.
 */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

/**
 * Identity of the current user (carrier). In a real app this comes from auth;
 * here it is a fixed constant shared by the mock seed and the bet mappers so
 * that "my bet" / "you" markers are consistent.
 */
export const CURRENT_USER = {
  organizationId: 14,
  subscriberId: 13,
  inn: '9616244307',
  name: 'ООО Перевозчик',
} as const;
