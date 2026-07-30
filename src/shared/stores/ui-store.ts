import { makeAutoObservable } from 'mobx';

/**
 * Point client-only UI state (not server data, not URL state).
 * Kept intentionally small — e.g. the mobile filters drawer visibility.
 */
class UiStore {
  mobileFiltersOpen = false;

  constructor() {
    makeAutoObservable(this);
  }

  toggleMobileFilters = (open?: boolean) => {
    this.mobileFiltersOpen = open ?? !this.mobileFiltersOpen;
  };
}

export const uiStore = new UiStore();
