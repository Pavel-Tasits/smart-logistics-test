import { Grid, Stack, Tabs } from '@mantine/core';
import type { AuctionDetailTab, AuctionDetailVM } from '@/entities/auction';
import { BetsListWidget } from '@/widgets/bets-list';
import { AuctionBetUnavailableAlert } from './AuctionBetUnavailableAlert.tsx';
import { AuctionCargoCard } from './AuctionCargoCard';
import { AuctionDetailHeader } from './AuctionDetailHeader';
import { AuctionOrganizerCard } from './AuctionOrganizerCard';
import { AuctionRouteCard } from './AuctionRouteCard';
import { AuctionTradingCard } from './AuctionTradingCard';

interface AuctionDetailWidgetProps {
  detail: AuctionDetailVM;
  tab: AuctionDetailTab;
  onTabChange: (tab: AuctionDetailTab) => void;
}

export function AuctionDetailWidget({
  detail,
  tab,
  onTabChange,
}: AuctionDetailWidgetProps) {
  const canBet = detail.trading.canSetBet;

  return (
    <Stack gap="lg">
      <AuctionDetailHeader detail={detail} />

      <Tabs
        value={tab}
        onChange={(value) => {
          if (value === 'about' || value === 'bets') {
            onTabChange(value);
          }
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="about">Об аукционе</Tabs.Tab>

          <Tabs.Tab value="bets">Ставки</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="about" pt="md">
          <Grid gap="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <AuctionTradingCard
                trading={detail.trading}
                my={detail.my}
                currency={detail.currency}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <AuctionCargoCard
                cargo={detail.cargo}
                restrictions={detail.restrictions}
                currency={detail.currency}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <AuctionRouteCard route={detail.route} restrictions={detail.restrictions} />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <AuctionOrganizerCard
                organizer={detail.organizer}
                contacts={detail.contacts}
                payment={detail.payment}
              />
            </Grid.Col>
          </Grid>

          {!canBet && <AuctionBetUnavailableAlert />}
        </Tabs.Panel>

        <Tabs.Panel value="bets" pt="md">
          <BetsListWidget
            auctionUuid={detail.uuid}
            hideBetsHistory={detail.restrictions.hideBetsHistory}
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
