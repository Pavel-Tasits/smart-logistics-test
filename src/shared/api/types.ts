import type { components, operations } from './schema.gen';

export type Schemas = components['schemas'];

// Enums (source of truth from the schema)
export type AuctionType = Schemas['AuctionType'];
export type AuctionStatus = Schemas['AuctionStatus'];
export type TradingStatus = Schemas['TradingStatus'];
export type BidMeasurementType = Schemas['BidMeasurementType'];
export type OperationType = Schemas['OperationType'];
export type PaymentDelayType = Schemas['PaymentDelayType'];

// List
export type AuctionListRequest = Schemas['AuctionListRequest'];
export type AuctionListResponseBase = Schemas['AuctionListResponseBase'];
export type AuctionListItem = Schemas['AuctionListItem'];
export type AuctionListItemMain = Schemas['AuctionListItemMain'];
export type AuctionListItemTrading = Schemas['AuctionListItemTrading'];
export type AuctionListMeta = Schemas['AuctionListMeta'];
export type CompetitiveAuctionType = Exclude<AuctionType, 'FixPrice'>;

// Detail
export type AuctionShowResponse = Schemas['AuctionShowResponse'];
export type AuctionShowMain = Schemas['AuctionShowMain'];
export type AuctionShowOrganizer = Schemas['AuctionShowOrganizer'];
export type AuctionShowCargo = Schemas['AuctionShowCargo'];
export type AuctionShowTrading = Schemas['AuctionShowTrading'];
export type AuctionShowTradingPrice = Schemas['AuctionShowTradingPrice'];
export type AuctionShowTradingYour = Schemas['AuctionShowTradingYour'];
export type AuctionShowPayment = Schemas['AuctionShowPayment'];
export type Contact = Schemas['Contact'];
export type RoutePoint = Schemas['RoutePoint'];
export type CarRequirements = Schemas['CarRequirements'];

// Bets
export type BetListResponse = Schemas['BetListResponse'];
export type BetItem = Schemas['BetItem'];

// Bet placement
export type SetBetRequest = Schemas['SetBetRequest'];

// Errors
export type ProblemDetail = Schemas['ProblemDetail'];
export type ValidationProblem = Schemas['ValidationProblem'];
export type ValidationError = Schemas['ValidationError'];

export type { operations };
