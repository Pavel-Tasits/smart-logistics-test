import { Card, Grid, Stack, Title } from '@mantine/core';
import { formatMoney } from '@/shared/lib/format';
import type { AuctionDetailVM } from '@/entities/auction';
import { formatMoneyRange } from '../lib/format-money-range';
import { DetailField } from './DetailField';

interface AuctionTradingCardProps {
  trading: AuctionDetailVM['trading'];
  my: AuctionDetailVM['my'];
  currency: AuctionDetailVM['currency'];
}

export function AuctionTradingCard({ trading, my, currency }: AuctionTradingCardProps) {
  const { price } = trading;

  return (
    <Card withBorder radius="md" padding="md" h="100%">
      <Stack gap="sm">
        <Title order={5}>Параметры торгов</Title>

        <Grid component="dl" gap="xs" m={0}>
          <Grid.Col span={6}>
            <DetailField label="Текущая цена">
              <strong>{formatMoney(price.current, currency)}</strong>
            </DetailField>
          </Grid.Col>

          <Grid.Col span={6}>
            <DetailField label="Доступная цена">
              {formatMoney(price.available, currency)}
            </DetailField>
          </Grid.Col>

          <Grid.Col span={6}>
            <DetailField label="Мин. / Макс.">
              {formatMoneyRange(price.min, price.max, currency)}
            </DetailField>
          </Grid.Col>

          <Grid.Col span={6}>
            <DetailField label="Шаг">{formatMoney(price.step, currency)}</DetailField>
          </Grid.Col>

          <Grid.Col span={6}>
            <DetailField label="Цена за км">
              {formatMoney(price.pricePerKm, currency)}
            </DetailField>
          </Grid.Col>

          <Grid.Col span={6}>
            <DetailField label="Моя ставка">
              {my.hasBet ? formatMoney(my.lastBetWithVat, currency) : 'нет'}
            </DetailField>
          </Grid.Col>
        </Grid>
      </Stack>
    </Card>
  );
}
