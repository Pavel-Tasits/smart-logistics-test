import { Link } from '@tanstack/react-router';
import { Badge, Button, Group, Stack, Title } from '@mantine/core';
import {
  AUCTION_STATUS_COLOR,
  AUCTION_STATUS_LABEL,
  AUCTION_TYPE_LABEL,
  TRADING_STATUS_COLOR,
  TRADING_STATUS_LABEL,
  type AuctionDetailVM,
} from '@/entities/auction';

interface AuctionDetailHeaderProps {
  detail: AuctionDetailVM;
}

export function AuctionDetailHeader({ detail }: AuctionDetailHeaderProps) {
  const { trading, my } = detail;
  const canBet = trading.canSetBet;

  return (
    <Group justify="space-between" align="flex-start" wrap="wrap">
      <Stack gap={4}>
        <Group gap="sm">
          <Title order={3}>№ {detail.cargoNum}</Title>

          <Badge color={AUCTION_STATUS_COLOR[detail.status]} variant="light">
            {AUCTION_STATUS_LABEL[detail.status]}
          </Badge>

          <Badge variant="outline" color="gray">
            {AUCTION_TYPE_LABEL[detail.aucType]}
          </Badge>
        </Group>

        {detail.userStatus && detail.userStatus !== 'NotParticipating' && (
          <Badge variant="dot" color={TRADING_STATUS_COLOR[detail.userStatus]}>
            {TRADING_STATUS_LABEL[detail.userStatus]}
          </Badge>
        )}
      </Stack>

      {canBet ? (
        <Button
          renderRoot={(props) => (
            <Link
              {...props}
              to="/auctions/$auctionUuid/bet"
              params={{ auctionUuid: detail.uuid }}
            />
          )}
        >
          {my.hasBet ? 'Изменить ставку' : 'Сделать ставку'}
        </Button>
      ) : (
        <Button disabled>Ставки закрыты</Button>
      )}
    </Group>
  );
}
