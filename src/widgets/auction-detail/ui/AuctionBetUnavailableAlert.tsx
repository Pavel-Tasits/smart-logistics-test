import { Alert } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

export function AuctionBetUnavailableAlert() {
  return (
    <Alert
      mt="md"
      color="gray"
      icon={<IconAlertTriangle size={16} />}
      title="Ставки недоступны"
    >
      Приём ставок для этого аукциона сейчас закрыт.
    </Alert>
  );
}
