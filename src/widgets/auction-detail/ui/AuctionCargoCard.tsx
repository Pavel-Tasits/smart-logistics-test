import { Badge, Card, Group, Stack, Title } from '@mantine/core';
import { IconPackage } from '@tabler/icons-react';
import { formatMoney } from '@/shared/lib/format';
import type { AuctionDetailVM } from '@/entities/auction';
import { formatTemperatureRange } from '../lib/format-temperature-range';
import { DetailField } from './DetailField';

interface AuctionCargoCardProps {
    cargo: AuctionDetailVM['cargo'];
    restrictions: AuctionDetailVM['restrictions'];
    currency: AuctionDetailVM['currency'];
}

export function AuctionCargoCard({
    cargo,
    restrictions,
    currency,
}: AuctionCargoCardProps) {
    const hasTemperatureRange =
        cargo.tempFrom != null || cargo.tempTo != null;

    return (
        <Card withBorder radius="md" padding="md" h="100%">
            <Stack component="dl" gap="sm">
                <Group gap="xs">
                    <IconPackage size={18} />
                    <Title order={5}>Груз и требования к ТС</Title>
                </Group>

                <DetailField label="Наименование">
                    {cargo.name}
                </DetailField>

                <Group gap="lg">
                    <DetailField label="Кузов">
                        {cargo.bodyType ?? '—'}
                    </DetailField>

                    <DetailField label="Расстояние">
                        {cargo.distanceKm != null
                            ? `${cargo.distanceKm} км`
                            : '—'}
                    </DetailField>

                    <DetailField label="Кол-во ТС">
                        {cargo.truckCount ?? '—'}
                    </DetailField>
                </Group>

                <DetailField label="Стоимость груза">
                    {restrictions.noViewCargoPrice
                        ? 'скрыта'
                        : cargo.price != null
                            ? formatMoney(cargo.price, currency)
                            : '—'}
                </DetailField>

                {hasTemperatureRange && (
                    <DetailField label="Температурный режим">
                        {formatTemperatureRange(
                            cargo.tempFrom,
                            cargo.tempTo,
                        )}
                    </DetailField>
                )}

                {cargo.isAdr && (
                    <Badge color="red" variant="light">
                        ADR (опасный груз)
                    </Badge>
                )}

                {cargo.car && (
                    <DetailField label="Требования к ТС">
                        {cargo.car.type}
                        {cargo.car.weight != null
                            ? ` · ${cargo.car.weight} т`
                            : ''}
                        {cargo.car.volume != null
                            ? ` · ${cargo.car.volume} м³`
                            : ''}
                    </DetailField>
                )}
            </Stack>
        </Card>
    );
}
