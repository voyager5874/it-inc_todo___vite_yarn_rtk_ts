import type { AsyncThunk } from '@reduxjs/toolkit';

import type { store } from 'app/store';

export type RootStateType = ReturnType<typeof store.getState>;
export type AppDispatchType = typeof store.dispatch;

export type EntityLoadingStatusType = 'idle' | 'loading' | 'succeeded' | 'failed';

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;
export type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>;
export type PendingAction = ReturnType<GenericAsyncThunk['pending']>;
export type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>;
