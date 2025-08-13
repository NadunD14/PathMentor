'use client';

import { useRef } from 'react';
import { type StoreApi, useStore } from 'zustand';

// This is a React Hook that can be used to create context-based stores
export function useStoreWithSelector<T, U>(
    store: (callback: (state: T) => unknown) => unknown,
    selector: (state: T) => U
): U {
    const storeRef = useRef<StoreApi<T> | null>(null);

    if (!storeRef.current) {
        // @ts-ignore
        storeRef.current = store;
    }

    // @ts-ignore
    return useStore(storeRef.current, selector);
}
