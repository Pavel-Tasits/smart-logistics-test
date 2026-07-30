import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Alert, Anchor, Button, Container, Group, Skeleton, Stack } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { ApiError } from '@/shared/api/error';
import {type AuctionDetailTab, useAuctionDetail} from '@/entities/auction';
import { AuctionDetailWidget } from '@/widgets/auction-detail';

interface AuctionDetailPageProps {
  auctionUuid: string;
  tab: AuctionDetailTab;
  onTabChange: (tab: AuctionDetailTab) => void;
  betSlot: ReactNode;
}

export function AuctionDetailPage({
  auctionUuid,
  tab,
  onTabChange,
  betSlot
}: AuctionDetailPageProps) {
  const { data, isLoading, isError, error, refetch } = useAuctionDetail(auctionUuid);
  const isNotFound = error instanceof ApiError && error.status === 404;

  return (
    <Container size="lg" py="lg">
      <Stack gap="md">
        <Anchor component={Link} to="/auctions" size="sm">
          <Group gap={4}>
            <IconArrowLeft size={14} /> К списку
          </Group>
        </Anchor>

        {isLoading && (
          <Stack gap="md">
            <Skeleton height={40} width="30%" />
            <Skeleton height={180} />
            <Skeleton height={180} />
          </Stack>
        )}

        {isError && isNotFound && (
          <Alert color="orange" title="Аукцион не найден">
            Аукцион с идентификатором {auctionUuid} не существует.
          </Alert>
        )}

        {isError && !isNotFound && (
          <Alert color="red" title="Ошибка загрузки">
            <Stack align="flex-start" gap="sm">
              Не удалось загрузить аукцион.
              <Button size="xs" variant="light" onClick={() => void refetch()}>
                Повторить
              </Button>
            </Stack>
          </Alert>
        )}

        {data &&
          <AuctionDetailWidget
            detail={data}
            tab={tab}
            onTabChange={onTabChange}
          />
        }
      </Stack>

      {betSlot}
    </Container>
  );
}
