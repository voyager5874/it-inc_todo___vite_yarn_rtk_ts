import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import type { EntityLoadingStatusType, RootStateType } from 'app';
import { addGoal } from 'features/goals';
import type {
  CreateTaskThunkArgType,
  UpdateTaskThunkArgType,
} from 'features/tasks/types';
import { RequestResultCode } from 'services/api/enums';
import { tasksAPI } from 'services/api/tasksAPI';
import type { TaskServerModelType } from 'services/api/types';
import { createDataSubmitAsyncThunk } from 'utils/createDataSubmitAsyncThunk';

const tasksAdapter = createEntityAdapter<TaskServerModelType>({
  // selectId: task => task.todoListId,
  sortComparer: (a, b) => a.order - b.order,
});

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (id: string) => {
  const response = await tasksAPI.getTasks(id);

  return { tasks: response.items, goalId: id };
});

export const addTask = createDataSubmitAsyncThunk(
  'tasks/addTask',
  async (apiCallData: CreateTaskThunkArgType, { rejectWithValue }) => {
    const { goalId, data } = apiCallData;
    const response = await tasksAPI.createTask(goalId, data);

    if (response.resultCode === RequestResultCode.Error) {
      return rejectWithValue({
        messages: response.messages,
        fieldsErrors: response.fieldsErrors,
      });
    }

    return { goalId, taskData: response.data.item };
  },
);

export const updateTask = createDataSubmitAsyncThunk(
  'tasks/updateTask',
  async (apiCallData: UpdateTaskThunkArgType, { rejectWithValue }) => {
    const { goalId, taskId, data } = apiCallData;
    const response = await tasksAPI.updateTask(goalId, taskId, data);

    if (response.resultCode === RequestResultCode.Error) {
      return rejectWithValue({
        messages: response.messages,
        fieldsErrors: response.fieldsErrors,
      });
    }

    return { goalId, taskData: response.data.item };
  },
);

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
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        const { tasks } = action.payload;

        tasksAdapter.setMany(state, tasks);
        state.sortedByGoalId[action.payload.goalId] = tasks;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        const { goalId, taskData } = action.payload;

        tasksAdapter.addOne(state, taskData);
        state.sortedByGoalId[goalId].push(taskData);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { goalId, taskData } = action.payload;
        const taskId = taskData.id;

        tasksAdapter.setOne(state, taskData);
        let taskToUpdate = state.sortedByGoalId[goalId].find(task => task.id === taskId);

        if (taskToUpdate) {
          taskToUpdate = taskData;
        }
      })
      .addCase(addGoal.fulfilled, (state, action) => {
        const { id } = action.payload;

        state.sortedByGoalId[id] = [];
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
