import { CURRENT_USER } from '@/shared/config';
import type { BetItem, BetListResponse } from '@/shared/api/types';
import type { BetVM, BetsVM } from './view-models';

export function mapBet(dto: BetItem): BetVM {
  const cancelReason = dto.cancel_reason?.trim() ? dto.cancel_reason.trim() : null;
  return {
    id: dto.id ?? 0,
    createdAt: dto.created_at ?? null,
    carrierName: dto.organization_name?.trim() ? dto.organization_name : null,
    carrierInn: dto.organization_inn ?? null,
    contactName: dto.contact_name?.trim() ? dto.contact_name : null,
    contactPhone: dto.contact_phone?.trim() ? dto.contact_phone : null,
    priceWithVat: dto.price_with_vat ?? null,
    priceNoVat: dto.price_no_vat ?? null,
    place: dto.place ?? null,
    isWin: dto.is_win ?? false,
    isRejected: dto.is_rejected ?? false,
    isCounter: dto.is_counter ?? false,
    cancelReason,
    isMine: dto.organization_id === CURRENT_USER.organizationId,
  };
}

/**
 * Map the bets response into a view model.
 * `historyHidden` is not part of the bets payload — it comes from the auction
 * detail (`trading.hide_bets_history`) and is threaded in by the caller.
 */
export function mapBets(dto: BetListResponse, historyHidden: boolean): BetsVM {
  const items = (dto.bets ?? []).map(mapBet);
  const participants = new Set(
    items.filter((b) => !b.isRejected).map((b) => b.carrierInn ?? String(b.id)),
  );
  return {
    items,
    participantsCount: participants.size,
    historyHidden,
  };
}
