import { createListenerMiddleware, addListener } from '@reduxjs/toolkit';
import type { TypedStartListening, TypedAddListener } from '@reduxjs/toolkit';

import type { AppDispatchType, RootStateType } from 'app/types';

export const listenerMiddleware = createListenerMiddleware();

export type AppStartListeningType = TypedStartListening<RootStateType, AppDispatchType>;

export const startAppListening =
  listenerMiddleware.startListening as AppStartListeningType;

export const addAppListener = addListener as TypedAddListener<
  RootStateType,
  AppDispatchType
>;
