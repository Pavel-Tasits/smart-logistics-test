import { Center, Loader, Modal, Text } from '@mantine/core';
import { useAuctionDetail } from '@/entities/auction';
import { PlaceBetForm } from '@/features/place-bet';

interface BetModalPageProps {
  auctionUuid: string;
  onClose: () => void;
}

/** Bet form rendered as a modal over the detail page. Opens directly via its URL. */
export function BetModalPage({ auctionUuid, onClose }: BetModalPageProps) {
  const { data, isLoading, isError } = useAuctionDetail(auctionUuid);

  return (
    <Modal
      opened
      onClose={onClose}
      title={data?.my.hasBet ? 'Изменить ставку' : 'Сделать ставку'}
      centered
      size="lg"
    >
      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}
      {isError && <Text c="red">Не удалось загрузить аукцион.</Text>}
      {data && <PlaceBetForm auction={data} onSuccess={onClose} />}
    </Modal>
  );
}
