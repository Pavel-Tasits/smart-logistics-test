import { useEffect, useState } from 'react';
import {
  Button,
  Grid,
  Group,
  MultiSelect,
  NumberInput,
  Select,
  Switch,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { CITIES } from '@/shared/mocks/cities';
import {
  AUCTION_STATUS_FILTER,
  AUCTION_STATUS_LABEL,
  AUCTION_TYPES,
  AUCTION_TYPE_LABEL,
  TRADING_STATUS_FILTER,
  TRADING_STATUS_LABEL,
  countActiveFilters,
  type AuctionsSearch,
} from '@/entities/auction';

interface AuctionsFilterProps {
  value: AuctionsSearch;
  onChange: (patch: Partial<AuctionsSearch>) => void;
  onReset: () => void;
}

const cityOptions = CITIES.map((c) => ({ value: String(c.gcId), label: c.name }));
const aucStatusOptions = AUCTION_STATUS_FILTER.map((s) => ({
  value: s,
  label: AUCTION_STATUS_LABEL[s],
}));
const tradingStatusOptions = TRADING_STATUS_FILTER.map((s) => ({
  value: s,
  label: TRADING_STATUS_LABEL[s],
}));
const typeOptions = AUCTION_TYPES.map((t) => ({
  value: t,
  label: AUCTION_TYPE_LABEL[t],
}));

export function AuctionsFilter({ value, onChange, onReset }: AuctionsFilterProps) {
  const [cargoNum, setCargoNum] = useState(value.cargo_num ?? '');
  const [debouncedCargoNum] = useDebouncedValue(cargoNum, 350);

  useEffect(() => {
    const next = debouncedCargoNum.trim() || undefined;
    if (next !== value.cargo_num) onChange({ cargo_num: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCargoNum]);

  useEffect(() => {
    setCargoNum(value.cargo_num ?? '');
  }, [value.cargo_num]);

  const activeCount = countActiveFilters(value);

  return (
    <Grid gap="sm" align="flex-end">
      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <TextInput
          label="Номер заявки"
          placeholder="00000001059"
          value={cargoNum}
          onChange={(e) => setCargoNum(e.currentTarget.value)}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <MultiSelect
          label="Тип аукциона"
          placeholder="Любой"
          clearable
          data={typeOptions}
          value={value.auc_type ?? []}
          onChange={(v) =>
            onChange({
              auc_type: v.length
                ? (v as NonNullable<AuctionsSearch['auc_type']>)
                : undefined,
            })
          }
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <MultiSelect
          label="Статус аукциона"
          placeholder="Любой"
          clearable
          data={aucStatusOptions}
          value={value.statuses ?? []}
          onChange={(v) =>
            onChange({
              statuses: v.length
                ? (v as NonNullable<AuctionsSearch['statuses']>)
                : undefined,
            })
          }
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <MultiSelect
          label="Мой статус в торгах"
          placeholder="Любой"
          clearable
          data={tradingStatusOptions}
          value={value.status ?? []}
          onChange={(v) =>
            onChange({
              status: v.length ? (v as NonNullable<AuctionsSearch['status']>) : undefined,
            })
          }
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Select
          label="Город погрузки"
          placeholder="Любой"
          clearable
          searchable
          data={cityOptions}
          value={value.load_gc_id != null ? String(value.load_gc_id) : null}
          onChange={(v) => onChange({ load_gc_id: v ? Number(v) : undefined })}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Select
          label="Город выгрузки"
          placeholder="Любой"
          clearable
          searchable
          data={cityOptions}
          value={value.unload_gc_id != null ? String(value.unload_gc_id) : null}
          onChange={(v) => onChange({ unload_gc_id: v ? Number(v) : undefined })}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
        <TextInput
          type="date"
          label="Погрузка с"
          value={value.load_date_from ?? ''}
          onChange={(e) =>
            onChange({ load_date_from: e.currentTarget.value || undefined })
          }
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
        <TextInput
          type="date"
          label="Погрузка по"
          value={value.load_date_to ?? ''}
          onChange={(e) => onChange({ load_date_to: e.currentTarget.value || undefined })}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
        <NumberInput
          label="Цена от"
          placeholder="0"
          min={0}
          hideControls
          value={value.current_price_from ?? ''}
          onChange={(v) =>
            onChange({ current_price_from: typeof v === 'number' ? v : undefined })
          }
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
        <NumberInput
          label="Цена до"
          placeholder="—"
          min={0}
          hideControls
          value={value.current_price_to ?? ''}
          onChange={(v) =>
            onChange({ current_price_to: typeof v === 'number' ? v : undefined })
          }
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Group gap="lg" h="100%" align="center">
          <Switch
            label="Доступные"
            checked={value.is_available ?? false}
            onChange={(e) =>
              onChange({ is_available: e.currentTarget.checked || undefined })
            }
          />
          <Switch
            label="Мои ставки"
            checked={value.is_bidder ?? false}
            onChange={(e) =>
              onChange({ is_bidder: e.currentTarget.checked || undefined })
            }
          />
        </Group>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Button
          variant="subtle"
          color="gray"
          disabled={activeCount === 0}
          onClick={onReset}
          fullWidth
        >
          Сбросить фильтры{activeCount ? ` (${activeCount})` : ''}
        </Button>
      </Grid.Col>
    </Grid>
  );
}
