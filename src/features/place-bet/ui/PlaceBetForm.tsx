import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Group, NumberInput, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { formatMoney } from '@/shared/lib/format';
import type { AuctionDetailVM } from '@/entities/auction';
import { createBetFormSchema, suggestBetPrice, type BetFormValues } from '@/entities/bet';
import { usePlaceBet } from '../model/use-place-bet';

interface PlaceBetFormProps {
  auction: AuctionDetailVM;
  onSuccess?: () => void;
}

export function PlaceBetForm({ auction, onSuccess }: PlaceBetFormProps) {
  const price = auction.trading.price;
  const currency = auction.currency;

  const schema = useMemo(
    () => createBetFormSchema({ min: price.min, max: price.max, step: price.step }),
    [price.min, price.max, price.step],
  );

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      price:
        suggestBetPrice({
          available: price.available,
          current: price.current,
          min: price.min,
        }) ?? 0,
    },
  });

  const mutation = usePlaceBet({
    auctionUuid: auction.uuid,
    onValidationError: (items) => {
      for (const item of items) {
        setError(item.field as keyof BetFormValues, { message: item.message });
      }
    },
    onSuccess: () => onSuccess?.(),
  });

  if (!auction.trading.canSetBet) {
    return (
      <Alert color="gray" icon={<IconInfoCircle size={16} />} title="Ставки закрыты">
        Для этого аукциона установка ставки сейчас недоступна.
      </Alert>
    );
  }

  const onSubmit = handleSubmit((values) => {
    mutation.mutate({ price: values.price });
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <Stack gap="md">
        <Alert variant="light" color="blue" icon={<IconInfoCircle size={16} />}>
          <Stack gap={2}>
            <Text size="sm">
              Текущая цена: <b>{formatMoney(price.current, currency)}</b>
            </Text>
            {price.available != null && (
              <Text size="sm">
                Доступная цена: <b>{formatMoney(price.available, currency)}</b>
              </Text>
            )}
            {price.step != null && (
              <Text size="sm">Шаг ставки: {formatMoney(price.step, currency)}</Text>
            )}
            {(price.min != null || price.max != null) && (
              <Text size="sm" c="dimmed">
                Диапазон: {formatMoney(price.min, currency)} —{' '}
                {formatMoney(price.max, currency)}
              </Text>
            )}
          </Stack>
        </Alert>

        <Controller
          control={control}
          name="price"
          render={({ field }) => (
            <NumberInput
              label="Ваша ставка (с НДС)"
              withAsterisk
              min={0}
              step={price.step ?? undefined}
              thousandSeparator=" "
              suffix={` ${currency}`}
              error={errors.price?.message}
              value={Number.isFinite(field.value) ? field.value : ''}
              onChange={(v) => field.onChange(typeof v === 'number' ? v : NaN)}
              onBlur={field.onBlur}
            />
          )}
        />

        <Group justify="flex-end">
          <Button type="submit" loading={mutation.isPending}>
            {auction.my.hasBet ? 'Изменить ставку' : 'Сделать ставку'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
