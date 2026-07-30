import type { ReactNode } from 'react';
import { Badge, Card, Group, Stack, Text } from '@mantine/core';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';
import { formatDate, formatMoney } from '@/shared/lib/format';
import {
  AUCTION_STATUS_COLOR,
  AUCTION_STATUS_LABEL,
  AUCTION_TYPE_LABEL,
  TRADING_STATUS_COLOR,
  TRADING_STATUS_LABEL,
} from '../model/labels';
import type { AuctionListItemVM } from '../model/view-models';

interface AuctionCardProps {
  item: AuctionListItemVM;
  /** Primary-action controls supplied by the widget (routing-aware). */
  actionSlot?: ReactNode;
  onPointerEnter?: () => void;
  onFocusCapture?: () => void;
}

export function AuctionCard({
  item,
  actionSlot,
  onPointerEnter,
  onFocusCapture,
}: AuctionCardProps) {
  return (
    <Card
      withBorder
      radius="md"
      padding="md"
      onPointerEnter={onPointerEnter}
      onFocusCapture={onFocusCapture}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div>
            <Text fw={600}>№ {item.cargoNum}</Text>
            <Text size="sm" c="dimmed">
              {item.cargo.name}
              {item.cargo.bodyType ? ` · ${item.cargo.bodyType}` : ''}
              {item.cargo.weight ? ` · ${item.cargo.weight} т` : ''}
            </Text>
          </div>
          <Badge color={AUCTION_STATUS_COLOR[item.status]} variant="light">
            {AUCTION_STATUS_LABEL[item.status]}
          </Badge>
        </Group>

        <Group gap="xs">
          <Badge variant="outline" color="gray">
            {AUCTION_TYPE_LABEL[item.aucType]}
          </Badge>
          {item.userStatus && item.userStatus !== 'NotParticipating' && (
            <Badge variant="dot" color={TRADING_STATUS_COLOR[item.userStatus]}>
              {TRADING_STATUS_LABEL[item.userStatus]}
            </Badge>
          )}
          {item.hasMyBet && (
            <Badge variant="light" color="blue" leftSection={<IconCheck size={12} />}>
              Моя ставка
            </Badge>
          )}
        </Group>

        <Group gap={6} wrap="nowrap">
          <Text fw={500}>{item.load.city}</Text>
          <IconArrowRight size={16} />
          <Text fw={500}>{item.unload.city}</Text>
          <Text size="sm" c="dimmed">
            {item.load.date ? `· ${formatDate(item.load.date)}` : ''}
          </Text>
        </Group>

        <Group justify="space-between" align="flex-end">
          <div>
            <Text size="xs" c="dimmed">
              Текущая цена
            </Text>
            <Text fw={700} size="lg">
              {formatMoney(item.currentPrice, item.currency)}
            </Text>
            <Text size="xs" c="dimmed">
              {item.pricePerKm != null
                ? `${formatMoney(item.pricePerKm, item.currency)}/км`
                : ''}
            </Text>
          </div>
          {actionSlot && <Group gap="xs">{actionSlot}</Group>}
        </Group>
      </Stack>
    </Card>
  );
}
