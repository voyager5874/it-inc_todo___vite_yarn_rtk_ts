import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import type { EntityLoadingStatusType, RootStateType } from 'app';
import { addList, deleteList } from 'features/lists';
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

  return { tasks: response.items, listId: id };
});

export const addTask = createDataSubmitAsyncThunk(
  'tasks/addTask',
  async (apiCallData: CreateTaskThunkArgType, { rejectWithValue }) => {
    const { listId, data } = apiCallData;
    const response = await tasksAPI.createTask(listId, data);

    if (response.resultCode === RequestResultCode.Error) {
      return rejectWithValue({
        messages: response.messages,
        fieldsErrors: response.fieldsErrors,
      });
    }

    return { listId, taskData: response.data.item };
  },
);

export const updateTask = createDataSubmitAsyncThunk(
  'tasks/updateTask',
  async (apiCallData: UpdateTaskThunkArgType, { rejectWithValue }) => {
    const { listId, taskId, data } = apiCallData;
    const response = await tasksAPI.updateTask(listId, taskId, data);

    if (response.resultCode === RequestResultCode.Error) {
      return rejectWithValue({
        messages: response.messages,
        fieldsErrors: response.fieldsErrors,
      });
    }

    return { listId, taskData: response.data.item };
  },
);

const initialState = tasksAdapter.getInitialState({
  filter: 'all' as 'all' | 'inProgress' | 'done',
  loading: 'idle' as EntityLoadingStatusType,
  sortedByListId: {} as Record<string, TaskServerModelType[]>,
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    taskAdded: tasksAdapter.addOne,
    tasksReceived(state, action: PayloadAction<{ tasks: TaskServerModelType[] }>) {
      const { tasks } = action.payload;

      tasksAdapter.upsertMany(state, tasks);
      state.sortedByListId[tasks[0].todoListId] = tasks;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        const { tasks } = action.payload;

        tasksAdapter.setMany(state, tasks);
        state.sortedByListId[action.payload.listId] = tasks;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        const { listId, taskData } = action.payload;

        tasksAdapter.addOne(state, taskData);
        state.sortedByListId[listId].push(taskData);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { listId, taskData } = action.payload;
        const taskId = taskData.id;

        tasksAdapter.updateOne(state, { id: taskId, changes: taskData });
        const taskToUpdate = state.sortedByListId[listId].find(
          task => task.id === taskId,
        );

        if (taskToUpdate) {
          Object.assign(taskToUpdate, taskData);
        }
      })
      .addCase(addList.fulfilled, (state, action) => {
        const { id } = action.payload;

        state.sortedByListId[id] = [];
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        const tasksIds = state.sortedByListId[action.payload.listId].map(task => task.id);

        tasksAdapter.removeMany(state, tasksIds);
        delete state.sortedByListId[action.payload.listId];
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

export const selectTasksByListId = (
  state: RootStateType,
  listId: string,
): TaskServerModelType[] => state.tasks.sortedByListId[listId];
