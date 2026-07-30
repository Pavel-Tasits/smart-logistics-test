import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { ApiError } from '@/shared/api/error';
import type { SetBetRequest, ValidationError } from '@/shared/api/types';
import { auctionKeys } from '@/entities/auction';
import { setBet } from '@/entities/bet';

interface UsePlaceBetOptions {
  auctionUuid: string;
  onValidationError?: (errors: ValidationError[]) => void;
  onSuccess?: () => void;
}

export function usePlaceBet({
  auctionUuid,
  onValidationError,
  onSuccess,
}: UsePlaceBetOptions) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, SetBetRequest>({
    mutationFn: (request) => setBet(auctionUuid, request),
    onSuccess: async () => {
      notifications.show({
        color: 'green',
        title: 'Ставка принята',
        message: 'Ваша ставка сохранена и учтена в торгах.',
      });

      // Refresh everything that depends on the auction's trading state.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: auctionKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: auctionKeys.detail(auctionUuid) }),
        queryClient.invalidateQueries({ queryKey: ['bets', auctionUuid] }),
      ]);

      onSuccess?.();
    },
    onError: (error) => {
      const validation = error.validation;
      if (validation) {
        onValidationError?.(validation.errors);
        notifications.show({
          color: 'red',
          title: 'Проверьте ставку',
          message: validation.message,
        });
        return;
      }
      notifications.show({
        color: 'red',
        title: 'Не удалось поставить ставку',
        message: error.displayMessage,
      });
    },
  });
}
