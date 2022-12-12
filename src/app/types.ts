import type { store } from 'app/store';

export type RootStateType = ReturnType<typeof store.getState>;
export type AppDispatchType = typeof store.dispatch;

export type EntityLoadingStatusType = 'idle' | 'loading' | 'succeeded' | 'failed';
