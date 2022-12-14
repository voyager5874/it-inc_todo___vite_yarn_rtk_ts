import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import type { EntityLoadingStatusType, RootStateType } from 'app';
import { tasksAPI } from 'services/api/tasksAPI';
import type { TaskServerModelType } from 'services/api/types';

const tasksAdapter = createEntityAdapter<TaskServerModelType>({
  // selectId: task => task.todoListId,
  sortComparer: (a, b) => a.title.localeCompare(b.title),
});

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (id: string) => {
  const response = await tasksAPI.getTasks(id);

  // if (id === '44537b83-cd7a-4aae-86bf-0d517a4e058d') {
  //   debugger;
  // }

  return { tasks: response.items, goalId: id };
});

const initialState = tasksAdapter.getInitialState({
  filter: 'all' as 'all' | 'inProgress' | 'done',
  loading: 'idle' as EntityLoadingStatusType,
  sortedByGoalId: {} as Record<string, TaskServerModelType[]>,
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    taskAdded: tasksAdapter.addOne,
    tasksReceived(state, action: PayloadAction<{ tasks: TaskServerModelType[] }>) {
      const { tasks } = action.payload;

      tasksAdapter.upsertMany(state, tasks);
      state.sortedByGoalId[tasks[0].todoListId] = tasks;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      const { tasks } = action.payload;

      tasksAdapter.upsertMany(state, tasks);
      state.sortedByGoalId[action.payload.goalId] = tasks;
    });
  },
});

export const tasksReducer = tasksSlice.reducer;

export const {
  selectAll: selectAllTasks,
  selectById: selectTaskBylId,
  selectIds: selectTasksIds,
} = tasksAdapter.getSelectors<RootStateType>(state => state.tasks);

// export const selectGoalTasks = createSelector(
//   [selectAllTasks, (state, goalId) => goalId],
//   (tasks, goalId) => tasks.filter(task => task.todoListId === goalId),
// );

export const selectTasksByGoalId = (
  state: RootStateType,
  goalId: string,
): TaskServerModelType[] => state.tasks.sortedByGoalId[goalId];
