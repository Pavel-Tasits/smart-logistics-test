import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from '@/shared/api/query-client';
import { USE_MOCKS } from '@/shared/config';
import { router } from '@/app/router';
import { ErrorBoundary } from '@/app/ErrorBoundary';

async function bootstrap() {
  if (USE_MOCKS) {
    const { startMockWorker } = await import('@/shared/mocks/browser');
    await startMockWorker();
  }

  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element #root not found');

  createRoot(rootElement).render(
    <StrictMode>
      <MantineProvider defaultColorScheme="light">
        <Notifications position="top-right" />
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </ErrorBoundary>
      </MantineProvider>
    </StrictMode>,
  );
}

void bootstrap();
