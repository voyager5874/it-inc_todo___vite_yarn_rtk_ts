import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import type { EntityLoadingStatusType, RootStateType } from 'app';
import { goalsAPI } from 'services/api/goalsAPI';
import type { GoalServerModelType } from 'services/api/types';

const goalsAdapter = createEntityAdapter<GoalServerModelType>({
  sortComparer: (a, b) => a.title.localeCompare(b.title),
});

export const fetchGoals = createAsyncThunk('goals/fetchGoals', async () => {
  return goalsAPI.getGoals();
});

const initialState = goalsAdapter.getInitialState({
  filter: 'all' as 'all' | 'inProgress' | 'done',
  loading: 'idle' as EntityLoadingStatusType,
});

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    goalAdded: goalsAdapter.addOne,
    goalsReceived(state, action: PayloadAction<{ goals: GoalServerModelType[] }>) {
      goalsAdapter.setAll(state, action.payload.goals);
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchGoals.fulfilled, (state, action) => {
      goalsAdapter.setAll(state, action.payload);
    });
  },
});

export const goalsReducer = goalsSlice.reducer;

export const {
  selectAll: selectAllGoals,
  selectById: selectGoalById,
  selectIds: selectGoalsIds,
} = goalsAdapter.getSelectors<RootStateType>(state => state.goals);
