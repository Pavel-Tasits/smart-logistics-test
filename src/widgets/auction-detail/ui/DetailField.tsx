import type { ReactNode } from 'react';
import { Box, Text } from '@mantine/core';

interface DetailFieldProps {
    label: string;
    children: ReactNode;
}

export function DetailField({ label, children }: DetailFieldProps) {
    return (
        <Box>
            <Text component="dt" size="xs" c="dimmed">
                {label}
            </Text>

            <Text component="dd" size="sm" m={0}>
                {children}
            </Text>
        </Box>
    );
}
