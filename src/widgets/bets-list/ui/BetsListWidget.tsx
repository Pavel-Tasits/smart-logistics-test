import { Alert, Badge, Center, Group, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconEyeOff, IconMoodEmpty, IconTrophy } from '@tabler/icons-react';
import { formatMoney } from '@/shared/lib/format';
import { mapBets, useBets } from '@/entities/bet';

interface BetsListWidgetProps {
  auctionUuid: string;
  /** From auction detail (trading.hide_bets_history). */
  hideBetsHistory: boolean;
}

export function BetsListWidget({ auctionUuid, hideBetsHistory }: BetsListWidgetProps) {
  // `all=true` returns cancelled bets too so we can surface cancel reasons.
  const { data, isLoading, isError } = useBets(auctionUuid, true);

  if (isLoading) {
    return (
      <Stack gap="xs">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height={40} radius="sm" />
        ))}
      </Stack>
    );
  }

  if (isError || !data) {
    return (
      <Alert color="red" title="Ошибка">
        Не удалось загрузить ставки.
      </Alert>
    );
  }

  const vm = mapBets(data, hideBetsHistory);

  if (vm.historyHidden) {
    return (
      <Center mih={160}>
        <Stack align="center" gap="xs">
          <IconEyeOff size={36} opacity={0.5} />
          <Text c="dimmed">Организатор скрыл историю ставок.</Text>
          <Text size="sm" c="dimmed">
            Участников: {vm.participantsCount}
          </Text>
        </Stack>
      </Center>
    );
  }

  if (vm.items.length === 0) {
    return (
      <Center mih={160}>
        <Stack align="center" gap="xs">
          <IconMoodEmpty size={36} opacity={0.5} />
          <Text c="dimmed">Ставок пока нет. Будьте первым!</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="sm">
      <Text size="sm" c="dimmed">
        Участников: {vm.participantsCount} · Ставок: {vm.items.length}
      </Text>
      <Table.ScrollContainer minWidth={560}>
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Место</Table.Th>
              <Table.Th>Перевозчик</Table.Th>
              <Table.Th>Без НДС</Table.Th>
              <Table.Th>С НДС</Table.Th>
              <Table.Th>Статус</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {vm.items.map((bet) => (
              <Table.Tr key={bet.id} opacity={bet.isRejected ? 0.55 : 1}>
                <Table.Td>{bet.place ?? '—'}</Table.Td>
                <Table.Td>
                  <Group gap={6} wrap="nowrap">
                    <Text size="sm" td={bet.isRejected ? 'line-through' : undefined}>
                      {bet.carrierName ?? 'Скрыто'}
                    </Text>
                    {bet.isMine && (
                      <Badge size="xs" color="blue" variant="light">
                        Вы
                      </Badge>
                    )}
                    {bet.isCounter && (
                      <Badge size="xs" color="grape" variant="light">
                        Встречная
                      </Badge>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td>{formatMoney(bet.priceNoVat)}</Table.Td>
                <Table.Td>{formatMoney(bet.priceWithVat)}</Table.Td>
                <Table.Td>
                  {bet.isWin && (
                    <Badge
                      color="green"
                      variant="light"
                      leftSection={<IconTrophy size={12} />}
                    >
                      Победитель
                    </Badge>
                  )}
                  {bet.isRejected && (
                    <Badge color="red" variant="light" title={bet.cancelReason ?? ''}>
                      Отменена{bet.cancelReason ? `: ${bet.cancelReason}` : ''}
                    </Badge>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
}
