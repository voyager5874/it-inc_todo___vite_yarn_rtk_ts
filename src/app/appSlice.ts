import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { RootStateType } from 'app/types';
import { authenticateUser } from 'features/user/userSlice';

type InitialStateType = {
  status: 'idle' | 'busy';
  error: string | null;
  isInitialized: boolean;
};

const initialState: InitialStateType = {
  status: 'idle',
  error: null,
  isInitialized: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    changeAppInitializationStatus(state, action: PayloadAction<boolean>) {
      state.isInitialized = action.payload;
    },
    appErrorOccurred(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    resetAppError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(authenticateUser.fulfilled, state => {
        state.isInitialized = true;
      })
      .addCase(authenticateUser.rejected, (state, action) => {
        state.isInitialized = true;
        if (action.payload?.messages) {
          state.error = action.payload.messages.join(', ');
        } else {
          state.error = String(action.error);
        }
      });
  },
});

export const appReducer = appSlice.reducer;

export const selectAppInitializationStatus = (state: RootStateType): boolean =>
  state.app.isInitialized;
