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
import { countActiveFilters, type AuctionsSearch } from '@/entities/auction';
import {
  auctionStatusOptions,
  auctionTypeOptions,
  cityOptions,
  tradingStatusOptions,
} from '../model/filter-options';
import {
  normalizeAuctionStatuses,
  normalizeAuctionTypes,
  normalizeNumberInput,
  normalizeSelectNumber,
  normalizeTradingStatuses,
} from '../model/normalize-filter-value';
import { useDebouncedTextFilter } from '../model/use-debounced-text-filter';

interface AuctionsFilterProps {
  value: AuctionsSearch;
  onChange: (patch: Partial<AuctionsSearch>) => void;
  onReset: () => void;
}

export function AuctionsFilter({ value, onChange, onReset }: AuctionsFilterProps) {
  const [cargoNum, setCargoNum] = useDebouncedTextFilter({
    value: value.cargo_num,
    delay: 350,
    onCommit: (nextCargoNum) => {
      onChange({
        cargo_num: nextCargoNum,
      });
    },
  });

  const activeFiltersCount = countActiveFilters(value);

  const handleReset = () => {
    setCargoNum('');
    onReset();
  };

  return (
    <Grid gap="sm" align="flex-end">
      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <TextInput
          label="Номер заявки"
          placeholder="00000001059"
          value={cargoNum}
          onChange={(event) => {
            setCargoNum(event.currentTarget.value);
          }}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <MultiSelect
          clearable
          label="Тип аукциона"
          placeholder="Любой"
          data={auctionTypeOptions}
          value={value.auc_type ?? []}
          onChange={(selectedValues) => {
            onChange({
              auc_type: normalizeAuctionTypes(selectedValues),
            });
          }}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <MultiSelect
          clearable
          label="Статус аукциона"
          placeholder="Любой"
          data={auctionStatusOptions}
          value={value.statuses ?? []}
          onChange={(selectedValues) => {
            onChange({
              statuses: normalizeAuctionStatuses(selectedValues),
            });
          }}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <MultiSelect
          clearable
          label="Мой статус в торгах"
          placeholder="Любой"
          data={tradingStatusOptions}
          value={value.status ?? []}
          onChange={(selectedValues) => {
            onChange({
              status: normalizeTradingStatuses(selectedValues),
            });
          }}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Select
          clearable
          searchable
          label="Город погрузки"
          placeholder="Любой"
          data={cityOptions}
          value={value.load_gc_id != null ? String(value.load_gc_id) : null}
          onChange={(selectedValue) => {
            onChange({
              load_gc_id: normalizeSelectNumber(selectedValue),
            });
          }}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Select
          clearable
          searchable
          label="Город выгрузки"
          placeholder="Любой"
          data={cityOptions}
          value={value.unload_gc_id != null ? String(value.unload_gc_id) : null}
          onChange={(selectedValue) => {
            onChange({
              unload_gc_id: normalizeSelectNumber(selectedValue),
            });
          }}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
        <TextInput
          type="date"
          label="Погрузка с"
          max={value.load_date_to}
          value={value.load_date_from ?? ''}
          onChange={(event) => {
            onChange({
              load_date_from: event.currentTarget.value || undefined,
            });
          }}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
        <TextInput
          type="date"
          label="Погрузка по"
          min={value.load_date_from}
          value={value.load_date_to ?? ''}
          onChange={(event) => {
            onChange({
              load_date_to: event.currentTarget.value || undefined,
            });
          }}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
        <NumberInput
          hideControls
          label="Цена от"
          placeholder="0"
          min={0}
          max={value.current_price_to}
          value={value.current_price_from ?? ''}
          onChange={(inputValue) => {
            onChange({
              current_price_from: normalizeNumberInput(inputValue),
            });
          }}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
        <NumberInput
          hideControls
          label="Цена до"
          placeholder="—"
          min={value.current_price_from ?? 0}
          value={value.current_price_to ?? ''}
          onChange={(inputValue) => {
            onChange({
              current_price_to: normalizeNumberInput(inputValue),
            });
          }}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Group gap="lg" h="100%" align="center">
          <Switch
            label="Доступные"
            checked={value.is_available === true}
            onChange={(event) => {
              onChange({
                is_available: event.currentTarget.checked || undefined,
              });
            }}
          />

          <Switch
            label="Мои ставки"
            checked={value.is_bidder === true}
            onChange={(event) => {
              onChange({
                is_bidder: event.currentTarget.checked || undefined,
              });
            }}
          />
        </Group>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Button
          fullWidth
          variant="subtle"
          color="gray"
          disabled={activeFiltersCount === 0}
          onClick={handleReset}
        >
          Сбросить фильтры
          {activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
        </Button>
      </Grid.Col>
    </Grid>
  );
}
