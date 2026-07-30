import { lazy, Suspense } from 'react';
import { Anchor, AppShell, Center, Group, Loader, Title } from '@mantine/core';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import {
    auctionDetailSearchSchema,
    auctionsSearchSchema,
    type AuctionDetailTab,
    type AuctionsSearch,
} from '@/entities/auction';

// Lazy-loaded route components — each page ships as its own chunk.
const AuctionsPage = lazy(() =>
  import('@/pages/auctions').then((m) => ({ default: m.AuctionsPage })),
);
const AuctionDetailPage = lazy(() =>
  import('@/pages/auction-detail').then((m) => ({ default: m.AuctionDetailPage })),
);
const BetModalPage = lazy(() =>
  import('@/pages/auction-detail').then((m) => ({ default: m.BetModalPage })),
);

function PageLoader() {
  return (
    <Center mih={320}>
      <Loader />
    </Center>
  );
}

function RootLayout() {
  return (
    <AppShell header={{ height: 56 }} padding={0}>
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Anchor component={Link} to="/auctions" underline="never" c="inherit">
            <Title order={4}>🚚 Грузовые аукционы</Title>
          </Anchor>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

const auctionDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auctions/$auctionUuid',
    validateSearch: auctionDetailSearchSchema,
    component: AuctionDetailRouteComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/auctions', search: { page: 1, per_page: 20 } });
  },
});

const auctionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions',
  validateSearch: (search): AuctionsSearch => auctionsSearchSchema.parse(search),
  component: AuctionsRouteComponent,
});

function AuctionsRouteComponent() {
  const search = auctionsRoute.useSearch();
  const navigate = useNavigate({ from: auctionsRoute.fullPath });

  return (
    <Suspense fallback={<PageLoader />}>
      <AuctionsPage
        search={search}
        onFiltersChange={(patch) =>
            navigate({
              search: (prev) => ({
                ...prev,
                ...patch,
                page: 1,
              }),
              replace: true,
            })
        }
        onPageChange={(page) => navigate({ search: (prev) => ({ ...prev, page }) })}
        onResetFilters={() =>
            navigate({
              search: (prev) => ({
                page: 1,
                per_page: prev.per_page,
              }),
              replace: true,
            })
        }
      />
    </Suspense>
  );
}

function AuctionDetailRouteComponent() {
    const { auctionUuid } = auctionDetailRoute.useParams();
    const { tab } = auctionDetailRoute.useSearch();

    const navigate = useNavigate({
        from: auctionDetailRoute.fullPath,
    });

    const handleTabChange = (nextTab: AuctionDetailTab) => {
        void navigate({
            search: {
                tab: nextTab,
            },
            replace: true,
        });
    };

    return (
        <Suspense fallback={<PageLoader />}>
            <AuctionDetailPage
                auctionUuid={auctionUuid}
                tab={tab}
                onTabChange={handleTabChange}
                betSlot={<Outlet />}
            />
        </Suspense>
    );
}

const betRoute = createRoute({
  getParentRoute: () => auctionDetailRoute,
  path: 'bet',
  component: BetRouteComponent,
});

function BetRouteComponent() {
    const { auctionUuid } = betRoute.useParams();
    const navigate = useNavigate({ from: betRoute.fullPath });

    return (
        <Suspense
            fallback={
                <Center pos="fixed" inset={0}>
                    <Loader size="sm" />
                </Center>
            }
        >
            <BetModalPage
                auctionUuid={auctionUuid}
                onClose={() =>
                    navigate({
                        to: '/auctions/$auctionUuid',
                        params: { auctionUuid },
                        search: true,
                    })
                }
            />
        </Suspense>
    );
}

const routeTree = rootRoute.addChildren([
  indexRoute,
  auctionsRoute,
  auctionDetailRoute.addChildren([betRoute]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
