import { z } from 'zod';

export const auctionDetailSearchSchema = z.object({
  tab: z.enum(['about', 'bets']).catch('about'),
});

export type AuctionDetailTab = z.infer<typeof auctionDetailSearchSchema>['tab'];
