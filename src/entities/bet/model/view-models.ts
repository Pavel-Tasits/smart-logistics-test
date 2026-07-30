export interface BetVM {
  id: number;
  createdAt: string | null;
  carrierName: string | null;
  carrierInn: string | null;
  contactName: string | null;
  contactPhone: string | null;
  priceWithVat: number | null;
  priceNoVat: number | null;
  place: number | null;
  isWin: boolean;
  isRejected: boolean;
  isCounter: boolean;
  cancelReason: string | null;
  isMine: boolean;
}

export interface BetsVM {
  items: BetVM[];
  participantsCount: number;
  historyHidden: boolean;
}
