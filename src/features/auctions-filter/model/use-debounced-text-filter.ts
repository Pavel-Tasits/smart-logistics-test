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
    const [draft, setDraft] = useState(value ?? '');
    const onCommitRef = useRef(onCommit);

    useEffect(() => {
        onCommitRef.current = onCommit;
    }, [onCommit]);

    useEffect(() => {
        setDraft(value ?? '');
    }, [value]);

    useEffect(() => {
        const normalizedValue = draft.trim() || undefined;

        if (normalizedValue === value) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            onCommitRef.current(normalizedValue);
        }, delay);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [delay, draft, value]);

    return [draft, setDraft] as const;
}
