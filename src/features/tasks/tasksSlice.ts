import type { PayloadAction } from '@reduxjs/toolkit';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  isAnyOf,
} from '@reduxjs/toolkit';
import axios from 'axios';

import type { AppThunkApiType, RootStateType } from 'app';
import { addList, deleteList, selectListById } from 'features/lists';
import type {
  CreateTaskThunkArgType,
  FetchTasksReturnType,
  TaskIdentityType,
  UpdateTaskThunkArgType,
} from 'features/tasks/types';
import { serviceLogout } from 'features/user/userSlice';
import { SERVER_MAX_TASKS_PER_REQUEST } from 'services/api/constants';
import { RequestResultCode, TaskPriority, TaskStatus } from 'services/api/enums';
import { tasksAPI } from 'services/api/tasksAPI';
import type {
  TasksEndpointPostPutModelDataType,
  TaskServerModelType,
} from 'services/api/types';
import { createDataSubmitAsyncThunk } from 'utils/createDataSubmitAsyncThunk';

const tasksAdapter = createEntityAdapter<TaskServerModelType>({
  // selectId: task => task.todoListId,
  sortComparer: (a, b) => a.order - b.order,
});

export const {
  selectAll: selectAllTasks,
  selectById: selectTaskBylId,
  selectIds: selectTasksIds,
} = tasksAdapter.getSelectors<RootStateType>(state => state.tasks);

export const selectTasksByListId = (
  state: RootStateType,
  listId: string,
): TaskServerModelType[] => state.tasks.sortedByListId[listId] || [];

export const fetchTasks = createAsyncThunk<FetchTasksReturnType, string, AppThunkApiType>(
  'tasks/fetchTasks',
  async (id: string, { signal }) => {
    const source = axios.CancelToken.source();

    signal.addEventListener('abort', () => {
      source.cancel();
    });
    // dispatch(tasksOfListRequested(id));
    const response = await tasksAPI.getTasks(id, SERVER_MAX_TASKS_PER_REQUEST, 1, {
      cancelToken: source.token,
    });

    return { tasks: response.items, listId: id, tasksTotalCount: response.totalCount };
  },
  {
    condition: (id, { getState }) => {
      const requested = getState().tasks.loading;

      if (requested.includes(id)) return false;

      const tasks = selectTasksByListId(getState(), id);
      const list = selectListById(getState(), id);
      const taskCountReceived = tasks.length;
      // const taskCountReceived = tasks?.sortedByListId[id].length || null; // I have the selector
      const tasksCountTotal = list?.tasksTotalCount;

      if (tasksCountTotal !== null && tasksCountTotal === taskCountReceived) {
        return false;
      }
    },
  },
);

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
  async (apiCallData: UpdateTaskThunkArgType, { rejectWithValue, getState }) => {
    const { listId, taskId, data } = apiCallData;
    const currentTaskData = selectTaskBylId(getState(), taskId);
    let fullData: TasksEndpointPostPutModelDataType = {
      title: currentTaskData?.title || 'title',
    };

    if (currentTaskData) {
      const { status, order, startDate, priority, deadline, description, title } =
        currentTaskData;

      fullData = {
        title,
        status,
        order,
        startDate,
        priority,
        deadline,
        description,
        ...data,
      };
    }

    const response = await tasksAPI.updateTask(listId, taskId, fullData);

    if (response.resultCode === RequestResultCode.Error) {
      return rejectWithValue({
        messages: response.messages,
        fieldsErrors: response.fieldsErrors,
      });
    }

    return { listId, taskData: response.data.item };
  },
);

export const deleteTask = createDataSubmitAsyncThunk(
  'tasks/deleteTask',
  async (apiCallData: TaskIdentityType, { rejectWithValue }) => {
    const { listId, taskId } = apiCallData;
    const response = await tasksAPI.deleteTask(listId, taskId);

    if (response.resultCode === RequestResultCode.Error) {
      return rejectWithValue({
        messages: response.messages,
        fieldsErrors: response.fieldsErrors,
      });
    }

    return apiCallData;
  },
);

const initialState = tasksAdapter.getInitialState({
  filter: 'all' as 'all' | 'inProgress' | 'done',
  loading: [] as string[],
  sortedByListId: {} as Record<string, TaskServerModelType[]>,
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    taskAdded: tasksAdapter.addOne,
    tasksReceived: (state, action: PayloadAction<{ tasks: TaskServerModelType[] }>) => {
      const { tasks } = action.payload;

      tasksAdapter.upsertMany(state, tasks);
      state.sortedByListId[tasks[0].todoListId] = tasks;
    },
    tasksOfListRequested: (state, action: PayloadAction<{ listId: string }>) => {
      state.loading.push(action.payload.listId);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        const { tasks } = action.payload;

        tasksAdapter.setMany(state, tasks);
        state.sortedByListId[action.payload.listId] = tasks;
      })
      .addCase(fetchTasks.pending, (state, action) => {
        state.loading.push(action.meta.arg);
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
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const { listId, taskId } = action.payload;

        tasksAdapter.removeOne(state, taskId);
        const taskIndex = state.sortedByListId[listId].findIndex(
          task => task.id === taskId,
        );

        if (taskIndex !== -1) {
          state.sortedByListId[listId].splice(taskIndex, 1);
        }
      })
      .addCase(serviceLogout.fulfilled, () => initialState)
      .addMatcher(isAnyOf(fetchTasks.rejected, fetchTasks.fulfilled), (state, action) => {
        const listId = action.meta.arg;
        const idIndex = state.loading.indexOf(listId);

        if (idIndex !== -1) {
          state.loading.splice(idIndex, 1);
        }
      });
  },
});

export const tasksReducer = tasksSlice.reducer;

// export const selectGoalTasks = createSelector(
//   [selectAllTasks, (state, goalId) => goalId],
//   (tasks, goalId) => tasks.filter(task => task.todoListId === goalId),
// );

// Adding a separate selector function for every single field is not a good idea!
// That ends up turning Redux into something resembling a Java class with getter/setter functions for every field.
// It's not going to improve the code, and it's probably going to make the code worse - maintaining all those extra
// selectors is a lot of additional effort, and it will be harder to trace what values are being used where.

export const selectTaskTitle = createSelector(selectTaskBylId, task => {
  console.log('taskTitleSelector', task);
  if (task) {
    console.log('taskTitleSelector', task.title);

    return task.title;
  }

  return 'selectTaskTitle: task access error';
});

export const selectTaskDescription = createSelector(selectTaskBylId, task =>
  task ? task.description : 'selectTaskDescription: task access error',
);

export const selectTaskDeadline = createSelector(selectTaskBylId, task =>
  task ? task.deadline : 'selectTaskDeadline: task access error',
);

export const selectTaskStartDate = createSelector(selectTaskBylId, task =>
  task ? task.startDate : 'selectTaskStartDate: task access error',
);

export const selectTaskPriority = createSelector(selectTaskBylId, task =>
  task ? task.priority : 'selectTaskPriority: task access error',
);

export const selectTaskStatus = createSelector(selectTaskBylId, task =>
  task ? task.status : 'selectTaskStatus: task access error',
);

export const selectTaskParentId = createSelector(selectTaskBylId, task =>
  task ? task.todoListId : 'selectTaskParentId: task access error',
);

export const selectCompletedTasksOfList = createSelector(selectTasksByListId, tasks =>
  tasks.length ? tasks.filter(task => task.status === TaskStatus.Completed) : [],
);

export const selectLowPriorityTasksOfList = createSelector(selectTasksByListId, tasks =>
  tasks.length ? tasks.filter(task => task.priority === TaskPriority.Low) : [],
);

export const selectHighPriorityTasksOfList = createSelector(selectTasksByListId, tasks =>
  tasks.length ? tasks.filter(task => task.priority === TaskPriority.High) : [],
);

export const selectTasksOfListByPriority = createSelector(
  selectTasksByListId,
  (state: RootStateType, priority: TaskPriority) => priority,
  (tasks, priority) =>
    tasks.length ? tasks.filter(task => task.priority === priority) : [],
);

export const selectAllCompletedTasks = createSelector(selectAllTasks, tasks =>
  tasks.length ? tasks.filter(task => task.status === TaskStatus.Completed) : [],
);
