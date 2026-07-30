import { observer } from 'mobx-react-lite';
import {
  Alert,
  Box,
  Button,
  Center,
  Collapse,
  Group,
  Pagination,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconAlertTriangle, IconFilter, IconMoodEmpty } from '@tabler/icons-react';
import {
  AuctionCard,
  buildListRequest,
  useAuctionsList,
  type AuctionsSearch,
} from '@/entities/auction';
import { AuctionsFilter } from '@/features/auctions-filter';
import { useAuctionPrefetch } from '@/features/prefetch-auction';
import { uiStore } from '@/shared/stores/ui-store';
import {AuctionActions} from "@/widgets/auctions-list";

interface AuctionsListWidgetProps {
  search: AuctionsSearch;
  onFiltersChange: (patch: Partial<AuctionsSearch>) => void;
  onResetFilters: () => void;
  onPageChange: (page: number) => void;
}

export const AuctionsListWidget = observer(function AuctionsListWidget({
  search,
  onFiltersChange,
  onResetFilters,
  onPageChange,
}: AuctionsListWidgetProps) {
  const isDesktop = useMediaQuery('(min-width: 62em)');
  const prefetch = useAuctionPrefetch();

  const request = buildListRequest(search);
  const query = useAuctionsList(request);

  const filtersVisible = isDesktop || uiStore.mobileFiltersOpen;
  const lastPage = query.data?.meta.last_page ?? 1;
  const total = query.data?.meta.total ?? 0;
  const hasData = Boolean(query.data && !query.isError);

  return (
    <Stack gap="md">
      <Group justify="space-between" hiddenFrom="md">
        <Button
          variant="light"
          leftSection={<IconFilter size={16} />}
          onClick={() => uiStore.toggleMobileFilters()}
        >
          Фильтры
        </Button>
      </Group>

      <Collapse expanded={filtersVisible}>
        <Paper withBorder p="md" radius="md">
          <AuctionsFilter
            value={search}
            onChange={onFiltersChange}
            onReset={onResetFilters}
          />
        </Paper>
      </Collapse>

      <Body query={query} prefetch={prefetch} onRetry={() => void query.refetch()} />

      {hasData && lastPage > 1 && (
          <Center>
            <Pagination
                total={lastPage}
                value={search.page}
                onChange={onPageChange}
                disabled={query.isPlaceholderData}
            />
          </Center>
      )}

      {hasData && (
          <Text size="sm" c="dimmed" ta="center">
            Найдено: {total}
          </Text>
      )}
    </Stack>
  );
});

interface BodyProps {
  query: ReturnType<typeof useAuctionsList>;
  prefetch: (uuid: string) => void;
  onRetry: () => void;
}

function Body({ query, prefetch, onRetry }: BodyProps) {
  const { data, isLoading, isError, isPlaceholderData } = query;

  if (isLoading) return <ListSkeleton />;

  if (isError) {
    return (
      <Alert color="red" icon={<IconAlertTriangle size={16} />} title="Ошибка загрузки">
        <Stack gap="sm" align="flex-start">
          <Text size="sm">Не удалось загрузить список аукционов.</Text>
          <Button size="xs" variant="light" onClick={onRetry}>
            Повторить
          </Button>
        </Stack>
      </Alert>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <Center mih={240}>
        <Stack align="center" gap="xs">
          <IconMoodEmpty size={40} opacity={0.5} />
          <Text c="dimmed">Аукционы не найдены. Измените фильтры.</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box style={{ opacity: isPlaceholderData ? 0.6 : 1, transition: 'opacity 150ms' }}>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {data.items.map((item) => (
          <AuctionCard
            key={item.uuid}
            item={item}
            onPointerEnter={() => prefetch(item.uuid)}
            onFocusCapture={() => prefetch(item.uuid)}
            actionSlot={<AuctionActions item={item} />}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
}

function ListSkeleton() {
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
      {Array.from({ length: 6 }).map((_, i) => (
        <Paper key={i} withBorder p="md" radius="md">
          <Stack gap="sm">
            <Skeleton height={20} width="40%" />
            <Skeleton height={12} width="70%" />
            <Skeleton height={12} width="55%" />
            <Skeleton height={28} width="35%" mt="sm" />
          </Stack>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
