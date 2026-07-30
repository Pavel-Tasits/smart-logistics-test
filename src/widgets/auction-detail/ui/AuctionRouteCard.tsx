import {
    Alert,
    Card,
    Group,
    Stack,
    Text,
    Timeline,
    Title,
} from '@mantine/core';
import { IconEyeOff, IconMapPin } from '@tabler/icons-react';
import { formatDate } from '@/shared/lib/format';
import type { AuctionDetailVM } from '@/entities/auction';
import { getRoutePointKindLabel } from '../model/labels';

interface AuctionRouteCardProps {
    route: AuctionDetailVM['route'];
    restrictions: AuctionDetailVM['restrictions'];
}

export function AuctionRouteCard({
    route,
    restrictions,
}: AuctionRouteCardProps) {
    return (
        <Card withBorder radius="md" padding="md" h="100%">
            <Stack gap="sm">
                <Group gap="xs">
                    <IconMapPin size={18} />
                    <Title order={5}>Маршрут</Title>
                </Group>

                {restrictions.hidePointsAddressAndContacts && (
                    <Alert
                        color="gray"
                        icon={<IconEyeOff size={14} />}
                        p="xs"
                    >
                        Точные адреса и контакты скрыты организатором.
                    </Alert>
                )}

                {route.length > 0 ? (
                    <Timeline
                        active={route.length}
                        bulletSize={18}
                        lineWidth={2}
                    >
                        {route.map((point, index) => (
                            <Timeline.Item
                                key={`${point.kind}-${point.city}-${point.startDate ?? index}`}
                                title={`${getRoutePointKindLabel(point.kind)}: ${point.city}`}
                            >
                                {point.address && (
                                    <Text size="xs" c="dimmed">
                                        {point.address}
                                    </Text>
                                )}

                                {point.startDate && (
                                    <Text size="xs">
                                        Дата: {formatDate(point.startDate)}
                                    </Text>
                                )}

                                {point.contactName && (
                                    <Text size="xs" c="dimmed">
                                        {point.contactName}
                                        {point.contactPhone
                                            ? ` · ${point.contactPhone}`
                                            : ''}
                                    </Text>
                                )}
                            </Timeline.Item>
                        ))}
                    </Timeline>
                ) : (
                    <Text size="sm" c="dimmed">
                        Маршрут не указан.
                    </Text>
                )}
            </Stack>
        </Card>
    );
}
