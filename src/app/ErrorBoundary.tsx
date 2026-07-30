import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Center, Code, Stack, Text, Title } from '@mantine/core';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Top-level error boundary so a render-time throw shows a recoverable screen. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // In a real app this would go to Sentry / logging.
    console.error('Unhandled error:', error, info.componentStack);
  }

  private reset = () => this.setState({ error: null });

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <Center mih="100vh" p="lg">
        <Stack align="center" gap="md" maw={520}>
          <Title order={3}>Что-то пошло не так</Title>
          <Text c="dimmed" ta="center">
            Произошла непредвиденная ошибка в интерфейсе.
          </Text>
          <Code block>{error.message}</Code>
          <Button onClick={this.reset}>Попробовать снова</Button>
        </Stack>
      </Center>
    );
  }
}
