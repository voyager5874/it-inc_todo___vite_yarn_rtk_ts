import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import axios from 'axios';

import type { AppThunkApiType } from 'app';
import { startAppListening } from 'app/listenerMiddleware';
import { TEMPORARY_TASK_ID } from 'constants/optimisticUI';
import { deleteList, fetchLists } from 'features/lists';
import { selectListById, selectListsIds } from 'features/lists/selectors';
import { tasksAdapter } from 'features/tasks/normalizrAdapter';
import { selectTaskById, selectTasksByListId } from 'features/tasks/selectors';
import type {
  CreateTaskThunkArgType,
  FetchTasksReturnType,
  TaskIdentityType,
  UpdateTaskThunkArgType,
} from 'features/tasks/types';
import { serviceLogout } from 'features/user/userSlice';
import { SERVER_MAX_TASKS_PER_REQUEST } from 'services/api/constants';
import { RequestResultCode } from 'services/api/enums';
import { tasksAPI } from 'services/api/tasksAPI';
import type { TasksEndpointPostPutModelDataType } from 'services/api/types';
import { createDummyTaskObject } from 'utils';
import { mutablyDeleteItemFromArray } from 'utils/deleteFromArray';
import { createDataSubmitAsyncThunk } from 'utils/typedThunkCreators';

export const fetchTasks = createAsyncThunk<FetchTasksReturnType, string, AppThunkApiType>(
  'tasks/fetchTasks',
  async (id: string, { signal, dispatch }) => {
    const source = axios.CancelToken.source();

    signal.addEventListener('abort', () => {
      // this is temp, just playing around
      // without this dispatch, second request happens while the .rejected action due to abort  of
      // the first is still not dispatched, so condition returns false
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      dispatch(tasksSlice.actions.fetchTasksOfListRequestEnded({ listId: id }));
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
    const currentTaskData = selectTaskById(getState(), taskId);
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
  fetchAttempts: 0,
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    tasksOfAllListsRequested: state => {
      state.fetchAttempts += 1;
    },
    // taskAdded: tasksAdapter.addOne,
    // tasksReceived: (state, action: PayloadAction<{ tasks: TaskServerModelType[] }>) => {
    //   const { tasks } = action.payload;
    //
    //   tasksAdapter.upsertMany(state, tasks);
    //   state.sortedByListId[tasks[0].todoListId] = tasks;
    // },
    // tasksOfListRequested: (state, action: PayloadAction<{ listId: string }>) => {
    //   state.loading.push(action.payload.listId);
    // },
    fetchTasksOfListRequestEnded: (state, action: PayloadAction<{ listId: string }>) => {
      const { listId } = action.payload;

      mutablyDeleteItemFromArray(state.loading, listId);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        const { tasks } = action.payload;

        tasksAdapter.setMany(state, tasks);
      })
      .addCase(fetchTasks.pending, (state, action) => {
        state.loading.push(action.meta.arg);
      })
      .addCase(addTask.fulfilled, (state, action) => {
        const { taskData } = action.payload;

        tasksAdapter.removeOne(state, TEMPORARY_TASK_ID);
        tasksAdapter.addOne(state, taskData);
      })
      .addCase(addTask.pending, (state, action) => {
        const { data, listId } = action.meta.arg;

        tasksAdapter.addOne(
          state,
          createDummyTaskObject({
            ...data,
            id: TEMPORARY_TASK_ID,
            todoListId: listId as string,
            description: null,
          }),
        );
      })
      .addCase(addTask.rejected, state => {
        tasksAdapter.removeOne(state, TEMPORARY_TASK_ID);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { taskData } = action.payload;
        const taskId = taskData.id;

        tasksAdapter.updateOne(state, { id: taskId, changes: taskData });
      })
      // .addCase(addList.fulfilled, (state, action) => {
      //   const { id } = action.payload;
      //
      //   state.sortedByListId[id] = [];
      // })
      .addCase(deleteList.fulfilled, (state, action) => {
        // const tasksIds = state.sortedByListId[action.payload.listId].map(task => task.id);
        const { tasksIds } = action.payload;

        tasksAdapter.removeMany(state, tasksIds);
        // delete state.sortedByListId[action.payload.listId];
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const { taskId } = action.payload;

        tasksAdapter.removeOne(state, taskId);
      })
      .addCase(serviceLogout.fulfilled, () => initialState)
      .addMatcher(isAnyOf(fetchTasks.rejected, fetchTasks.fulfilled), (state, action) => {
        const listId = action.meta.arg;

        // const idIndex = state.loading.indexOf(listId);
        //
        // if (idIndex !== -1) {
        //   state.loading.splice(idIndex, 1);
        // }
        mutablyDeleteItemFromArray(state.loading, listId);
      });
  },
});

export const tasksReducer = tasksSlice.reducer;

// Every time an action is dispatched, each listener will be checked to see
// if it should run based on the current action vs the comparison option provided.

// startAppListening({
//   predicate: (action, currentState) => {
//     if (currentState.tasks.fetchAttempts > MAX_REQUEST_ATTEMPTS) return false;
//     const lists = selectListsIds(currentState) as string[];
//     const tasksReceived = lists.every(
//       id =>
//         Object.hasOwn(currentState.tasks.sortedByListId, id) &&
//         selectListById(currentState, id)?.tasksTotalCount !== null,
//     );
//
//     return (
//       currentState.lists.loading === 'succeeded' &&
//       !currentState.tasks.loading.length &&
//       !tasksReceived
//     );
//   },
//   effect: async (action, { dispatch, getState, condition, subscribe, unsubscribe }) => {
//     unsubscribe()
//     const lists = selectListsIds(getState()) as string[];
//
//     lists.forEach(listId => {
//       console.log('tasks requested', listId);
//       dispatch(fetchTasks(listId));
//     });
//     dispatch(tasksSlice.actions.tasksOfAllListsRequested());
//     console.log('all tasks requested');
//     console.log('loading', getState().tasks.loading);
//     await condition(() => getState().tasks.loading.length === 0);
//     //await condition((action, currentState) => currentState.tasks.loading.length === 0);
//     subscribe()
//     console.log('loading', getState().tasks.loading);
//     console.log('loading que is empty');
//   },
// });

startAppListening({
  // type: 'lists/fetchLists/fulfilled',
  predicate: action => {
    return fetchLists.fulfilled.match(action);
  },
  effect: async (action, { dispatch, getState }) => {
    const lists = selectListsIds(getState()) as string[];

    lists.forEach(listId => {
      dispatch(fetchTasks(listId));
    });
    dispatch(tasksSlice.actions.tasksOfAllListsRequested());
  },
});
