import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import type { EntityLoadingStatusType, RootStateType } from 'app';
import { RequestResultCode } from 'services/api/enums';
import { goalsAPI } from 'services/api/goalsAPI';
import type { GoalServerModelType } from 'services/api/types';
import { createDataSubmitAsyncThunk } from 'utils/createDataSubmitAsyncThunk';

const goalsAdapter = createEntityAdapter<GoalServerModelType>({
  sortComparer: (a, b) => b.order - a.order,
});

export const fetchGoals = createAsyncThunk('goals/fetchGoals', async () => {
  return goalsAPI.getGoals();
});

export const addGoal = createDataSubmitAsyncThunk(
  'goals/addGoal',
  async (title: string, { rejectWithValue }) => {
    const response = await goalsAPI.createGoal(title);

    if (response.resultCode === RequestResultCode.Error) {
      return rejectWithValue({
        messages: response.messages,
        fieldsErrors: response.fieldsErrors,
      });
    }

    return response.data.item;
  },
);

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
    builder
      .addCase(fetchGoals.fulfilled, (state, action) => {
        goalsAdapter.setAll(state, action.payload);
      })
      .addCase(addGoal.fulfilled, (state, action) => {
        goalsAdapter.addOne(state, action.payload);
      });
  },
});

export const goalsReducer = goalsSlice.reducer;

export const {
  selectAll: selectAllGoals,
  selectById: selectGoalById,
  selectIds: selectGoalsIds,
} = goalsAdapter.getSelectors<RootStateType>(state => state.goals);
