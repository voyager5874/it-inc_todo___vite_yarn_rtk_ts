import type { EntityId } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import type { AppThunkApiType, EntityLoadingStatusType } from 'app';
import { TEMPORARY_TASK_ID } from 'constants/optimisticUI';
import { MAX_REQUEST_ATTEMPTS } from 'constants/settings';
import { listsAdapter } from 'features/lists/normalizrAdapter';
import { selectTasksIdsByListId } from 'features/lists/selectors';
import type { ListEntityAppType, UpdateListThunkArgType } from 'features/lists/types';
import { addTask, deleteTask, fetchTasks } from 'features/tasks/tasksSlice';
import { serviceLogout } from 'features/user/userSlice';
import { startAppListening } from 'middlewares/listenerMiddleware';
import { RequestResultCode } from 'services/api/enums';
import { listsAPI } from 'services/api/listsAPI';
import { mutablyDeleteItemFromArray } from 'utils/deleteFromArray';
import { createDataSubmitAsyncThunk } from 'utils/typedThunkCreators';

export const fetchLists = createAsyncThunk<
  ListEntityAppType[],
  undefined,
  AppThunkApiType
>(
  'lists/fetchLists',
  async (_, { signal }) => {
    const source = axios.CancelToken.source();

    signal.addEventListener('abort', () => {
      source.cancel();
    });

    return listsAPI.getLists({
      cancelToken: source.token,
    });
  },
  {
    condition: (_, { getState }) => {
      const { lists, user } = getState();
      const fetchStatus = lists.loading;
      const { auth } = user;

      if (fetchStatus === 'succeeded' || fetchStatus === 'loading' || !auth) {
        return false;
      }
    },
  },
);

export const addList = createDataSubmitAsyncThunk(
  'lists/addList',
  async (title: string, { rejectWithValue }) => {
    const response = await listsAPI.createList(title);

    if (response.resultCode === RequestResultCode.Error) {
      return rejectWithValue({
        messages: response.messages,
        fieldsErrors: response.fieldsErrors,
      });
    }

    return response.data.item;
  },
);

export const deleteList = createDataSubmitAsyncThunk(
  'lists/deleteList',
  async (listId: EntityId, { rejectWithValue, getState }) => {
    const response = await listsAPI.deleteList(listId);

    if (response.resultCode === RequestResultCode.Error) {
      return rejectWithValue({
        messages: response.messages,
        fieldsErrors: response.fieldsErrors,
      });
    }
    const tasksIds = selectTasksIdsByListId(getState(), listId);

    return { listId, tasksIds };
  },
);

export const updateList = createDataSubmitAsyncThunk(
  'lists/updateList',
  async (apiCallData: UpdateListThunkArgType, { rejectWithValue }) => {
    const { listId, data } = apiCallData;
    const response = await listsAPI.updateList(listId, data);

    if (response.resultCode === RequestResultCode.Error) {
      return rejectWithValue({
        messages: response.messages,
        fieldsErrors: response.fieldsErrors,
      });
    }

    // server returns no data on success
    return apiCallData;
  },
);

const initialState = listsAdapter.getInitialState({
  filter: 'all' as 'all' | 'inProgress' | 'done',
  fetchAttempts: 0,
  loading: 'idle' as EntityLoadingStatusType,
});

const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    listAdded: listsAdapter.addOne,
    // listsReceived(state, action: PayloadAction<{ lists: ListServerModelType[] }>) {
    //   listsAdapter.setAll(state, action.payload.lists);
    // },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchLists.pending, (state, action) => {
        if (state.loading !== 'loading') {
          state.fetchAttempts += 1;
          state.loading = 'loading';
        }
        console.log('fetchLists.pending action.meta', action.meta);
      })
      .addCase(fetchLists.rejected, (state, action) => {
        if (state.loading !== 'failed') {
          state.loading = 'failed';
        }
        console.log('fetchLists.rej action.meta', action.meta);
      })
      .addCase(fetchLists.fulfilled, (state, action) => {
        if (state.loading !== 'succeeded') {
          state.loading = 'succeeded';
        }
        listsAdapter.setAll(state, action.payload);
        console.log('fetchLists.fulfilled action.meta', action.meta);
      })
      // .addCase(fetchTasks.fulfilled, (state, action) => {
      //   const listId = action.meta.arg;
      //   // const id = action.payload[0].listId;
      //   const list = state.entities[listId];
      //   const taskIds = action.payload.tasks.map(task => task.id);
      //
      //   if (list) {
      //     list.tasks = taskIds;
      //   }
      // })
      .addCase(addList.fulfilled, (state, action) => {
        listsAdapter.addOne(state, action.payload);
      })
      .addCase(addTask.fulfilled, (state, action) => {
        const { listId, taskData } = action.payload;
        const list = state.entities[listId];

        if (list) {
          mutablyDeleteItemFromArray(list.tasks, TEMPORARY_TASK_ID + taskData.title);
          list.tasks.push(taskData.id);
        }
      })
      .addCase(addTask.pending, (state, action) => {
        const { listId, data } = action.meta.arg;

        const list = state.entities[listId];

        if (list) {
          list.tasks.push(TEMPORARY_TASK_ID + data.title);
        }
      })
      .addCase(addTask.rejected, (state, action) => {
        const { listId, data } = action.meta.arg;

        const list = state.entities[listId];

        if (list) mutablyDeleteItemFromArray(list.tasks, TEMPORARY_TASK_ID + data.title);
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const { listId, taskId } = action.payload;
        const list = state.entities[listId];

        if (list) mutablyDeleteItemFromArray(list.tasks, taskId);
        // if (list) {
        //   const idIndex = list.tasks.indexOf(taskId);
        //
        //   if (idIndex) list.tasks.splice(idIndex, 1);
        // }
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        listsAdapter.removeOne(state, action.payload.listId);
      })
      .addCase(updateList.fulfilled, (state, action) => {
        const { listId, data } = action.payload;

        listsAdapter.updateOne(state, { id: listId, changes: data });
      })
      .addCase(serviceLogout.fulfilled, () => {
        return initialState;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        const { tasksTotalCount } = action.payload;
        const listId = action.meta.arg;
        // are they sorted by 'order' field on the backend?
        const taskIds = action.payload.tasks.map(task => task.id);

        listsAdapter.updateOne(state, {
          id: listId,
          changes: { tasksTotalCount, tasks: taskIds },
        });
      });
  },
});

export const listsReducer = listsSlice.reducer;

startAppListening({
  predicate: action => {
    return fetchLists.rejected.match(action);
  },
  effect: (action, { dispatch, getState, unsubscribe }) => {
    console.log('listener dispatched fetchLists');
    dispatch(fetchLists());
    if (getState().lists.fetchAttempts > MAX_REQUEST_ATTEMPTS) {
      unsubscribe();
    }
  },
});
