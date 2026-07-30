import { z } from 'zod';
import { validateBidPrice, type BetBounds } from '@/shared/lib/trading';

export interface BetFormValues {
  price: number;
}

/**
 * Build the bet-form validation schema for a specific auction.
 * Delegates numeric bounds (min / max / step / positivity) to the shared pure
 * {@link validateBidPrice} helper so the client and the mock server agree.
 */
export function createBetFormSchema(bounds: BetBounds) {
  return z
    .object({
      price: z.number({
        invalid_type_error: 'Введите цену',
        required_error: 'Введите цену',
      }),
    })
    .superRefine((values, ctx) => {
      for (const error of validateBidPrice(values.price, bounds)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['price'],
          message: error.message,
        });
      }
    });
}

export interface PriceHints {
  available: number | null;
  current: number | null;
  min: number | null;
}

/** Suggested initial price: hinted available price, else current, else min. */
export function suggestBetPrice(hints: PriceHints): number | undefined {
  return hints.available ?? hints.current ?? hints.min ?? undefined;
}
