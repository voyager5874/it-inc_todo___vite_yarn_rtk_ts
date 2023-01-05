import type { AsyncThunk } from '@reduxjs/toolkit';

import type { store } from 'app/store';

export type RootStateType = ReturnType<typeof store.getState>;
export type AppDispatchType = typeof store.dispatch;

export type EntityLoadingStatusType = 'idle' | 'loading' | 'succeeded' | 'failed';

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;
export type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>;
export type PendingAction = ReturnType<GenericAsyncThunk['pending']>;
export type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>;

// type AsyncThunkConfig = {
//   /** return type for `thunkApi.getState` */
//   state?: unknown;
//   /** type for `thunkApi.dispatch` */
//   dispatch?: AppDispatchType;
//   /** type of the `extra` argument for the thunk middleware, which will be passed in as `thunkApi.extra` */
//   extra?: unknown;
//   /** type to be passed into `rejectWithValue`'s first argument that will end up on `rejectedAction.payload` */
//   rejectValue?: unknown;
//   /** return type of the `serializeError` option callback */
//   serializedErrorType?: unknown;
//   /** type to be returned from the `getPendingMeta` option callback & merged into `pendingAction.meta` */
//   pendingMeta?: unknown;
//   /** type to be passed into the second argument of `fulfillWithValue` to finally be merged into `fulfilledAction.meta` */
//   fulfilledMeta?: unknown;
//   /** type to be passed into the second argument of `rejectWithValue` to finally be merged into `rejectedAction.meta` */
//   rejectedMeta?: unknown;
// };

export type AppThunkApiType = {
  // Optional fields for defining thunkApi field types
  dispatch: AppDispatchType;
  state: RootStateType;
};
