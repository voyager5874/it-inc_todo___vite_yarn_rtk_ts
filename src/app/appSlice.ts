import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, isAnyOf } from '@reduxjs/toolkit';

import type {
  FulfilledAction,
  PendingAction,
  RejectedAction,
  RootStateType,
} from 'app/types';
import { addList, deleteList, updateList } from 'features/lists';
import { addTask, updateTask } from 'features/tasks/tasksSlice';
import { authenticateUser, serviceLogin, serviceLogout } from 'features/user/userSlice';

type InitialStateType = {
  status: 'idle' | 'busy';
  error: string | null;
  success: string | null;
  info: string | null;
  isInitialized: boolean;
};

const initialState: InitialStateType = {
  status: 'idle',
  error: null,
  success: null,
  info: null,
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
    resetAppEvents(state) {
      state.error = null;
      state.success = null;
      state.info = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(authenticateUser.fulfilled, state => {
        state.isInitialized = true;
      })
      .addCase(authenticateUser.rejected, state => {
        state.isInitialized = true;
      })
      .addMatcher(
        isAnyOf(
          // isRejectedWithValue but need to exclude auth
          serviceLogin.rejected,
          serviceLogout.rejected,
          deleteList.rejected,
          // authenticateUser.rejected,
          addList.rejected,
          addTask.rejected,
          updateTask.rejected,
          updateList.rejected,
        ),
        (state, action) => {
          console.log(action.payload);
          console.log(action);
          if (action.payload?.messages.length) {
            state.error = action.payload.messages.join(', ');
          } else if (action.error.message) {
            state.error = action.error.message;
          } else {
            state.error = JSON.stringify(action.error);
          }
        },
      )
      .addMatcher<FulfilledAction>(
        action => action.type.endsWith('/fulfilled'),
        state => {
          state.status = 'idle';
        },
      )
      .addMatcher<PendingAction>(
        action => action.type.endsWith('/pending'),
        state => {
          state.status = 'busy';
        },
      )
      .addMatcher<RejectedAction>(
        action => action.type.endsWith('/rejected'),
        state => {
          state.status = 'idle';
        },
      );
  },
});

export const appReducer = appSlice.reducer;

export const { resetAppEvents } = appSlice.actions;

export const selectAppInitializationStatus = (state: RootStateType): boolean =>
  state.app.isInitialized;
