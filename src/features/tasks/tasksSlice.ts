import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import axios from 'axios';

import type { AppThunkApiType } from 'app';
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
import { startAppListening } from 'middlewares/listenerMiddleware';
import { SERVER_MAX_TASKS_PER_REQUEST } from 'services/api/constants';
import { RequestResultCode } from 'services/api/enums';
import { tasksAPI } from 'services/api/tasksAPI';
import type { TaskServerModelType } from 'services/api/types';
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

    const currentTaskData =
      selectTaskById(getState(), taskId) ||
      createDummyTaskObject({ title: 'error: updateTask -> selector' });

    const fullData = {
      ...currentTaskData,
      ...data,
    };

    // dispatch(
    //   // probably I have to create separate file
    //   // eslint-disable-next-line @typescript-eslint/no-use-before-define
    //   tasksSlice.actions.taskIsBeingModified({ id: taskId, changes: fullData }),
    // );

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
  asyncProcessedTask: null as TaskServerModelType | null,
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    tasksOfAllListsRequested: state => {
      state.fetchAttempts += 1;
    },
    // taskIsBeingModified: tasksAdapter.updateOne,
    // taskUpdateInProgress: tasksAdapter.addOne,
    // taskUpdateInProgress: tasksAdapter.addOne,
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

        tasksAdapter.removeOne(state, TEMPORARY_TASK_ID + taskData.title);
        tasksAdapter.addOne(state, taskData);
      })
      .addCase(addTask.pending, (state, action) => {
        const { data, listId } = action.meta.arg;

        tasksAdapter.addOne(
          state,
          createDummyTaskObject({
            ...data,
            id: TEMPORARY_TASK_ID + data.title,
            todoListId: listId as string,
            description: null,
          }),
        );
      })
      .addCase(addTask.rejected, (state, action) => {
        const { data } = action.meta.arg;

        tasksAdapter.removeOne(state, TEMPORARY_TASK_ID + data.title);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { taskData } = action.payload;
        const taskId = taskData.id;

        tasksAdapter.updateOne(state, { id: taskId, changes: taskData });
        if (state.asyncProcessedTask) {
          state.asyncProcessedTask = null;
        }
      })
      .addCase(updateTask.pending, (state, action) => {
        const { taskId, data } = action.meta.arg;
        const task = state.entities[taskId];

        // kind of impure -- this or try/catch in updateTask thunk
        if (task) {
          state.asyncProcessedTask = { ...task };
          tasksAdapter.updateOne(state, { id: taskId, changes: data });
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        const { taskId } = action.meta.arg;

        // kind of impure -- this or try/catch in updateTask thunk
        if (state.asyncProcessedTask) {
          // get rid of proxy
          const prevState = { ...state.asyncProcessedTask };

          tasksAdapter.updateOne(state, {
            id: taskId,
            changes: prevState,
          });
          state.asyncProcessedTask = null;
        }
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
