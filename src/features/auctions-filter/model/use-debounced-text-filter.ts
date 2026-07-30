import { useEffect, useRef, useState } from 'react';

interface UseDebouncedTextFilterOptions {
  value: string | undefined;
  delay?: number;
  onCommit: (value: string | undefined) => void;
}

export function useDebouncedTextFilter({
  value,
  delay = 350,
  onCommit,
}: UseDebouncedTextFilterOptions) {
  const externalValue = value ?? '';

  const [draft, setDraft] = useState(externalValue);

  const onCommitRef = useRef(onCommit);
  const previousExternalValueRef = useRef(externalValue);

  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);

  useEffect(() => {
    if (externalValue === previousExternalValueRef.current) {
      return;
    }

    previousExternalValueRef.current = externalValue;

    // Локальный draft синхронизируется с URL после reset,
    // Back/Forward или внешнего изменения search-параметров.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(externalValue);
  }, [externalValue]);

  useEffect(() => {
    const normalizedDraft = draft.trim() || undefined;

    if (normalizedDraft === value) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onCommitRef.current(normalizedDraft);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delay, draft, value]);

  return [draft, setDraft] as const;
}
