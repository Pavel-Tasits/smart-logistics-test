import { Container, Stack, Text, Title } from '@mantine/core';
import type { AuctionsSearch } from '@/entities/auction';
import { AuctionsListWidget } from '@/widgets/auctions-list';

interface AuctionsPageProps {
  search: AuctionsSearch;
  onFiltersChange: (patch: Partial<AuctionsSearch>) => void;
  onResetFilters: () => void;
  onPageChange: (page: number) => void;
}

export function AuctionsPage(props: AuctionsPageProps) {
  return (
    <Container size="lg" py="lg">
      <Stack gap="lg">
        <div>
          <Title order={2}>Грузовые аукционы</Title>
          <Text c="dimmed">Список аукционов, фильтры и ставки</Text>
        </div>
        <AuctionsListWidget {...props} />
      </Stack>
    </Container>
  );
}
