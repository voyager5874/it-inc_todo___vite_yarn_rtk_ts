import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import axios from 'axios';

import type { AppThunkApiType, EntityLoadingStatusType, RootStateType } from 'app';
import { startAppListening } from 'app/listenerMiddleware';
import { MAX_REQUEST_ATTEMPTS } from 'constants/settings';
import type { ListEntityAppType, UpdateListThunkArgType } from 'features/lists/types';
import { fetchTasks } from 'features/tasks/tasksSlice';
import { serviceLogout } from 'features/user/userSlice';
import { RequestResultCode } from 'services/api/enums';
import { listsAPI } from 'services/api/listsAPI';
import { createDataSubmitAsyncThunk } from 'utils/createDataSubmitAsyncThunk';

const listsAdapter = createEntityAdapter<ListEntityAppType>({
  sortComparer: (a, b) => b.order - a.order,
});

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
  async (listId: string, { rejectWithValue }) => {
    const response = await listsAPI.deleteList(listId);

    if (response.resultCode === RequestResultCode.Error) {
      return rejectWithValue({
        messages: response.messages,
        fieldsErrors: response.fieldsErrors,
      });
    }

    return { listId };
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
      .addCase(addList.fulfilled, (state, action) => {
        listsAdapter.addOne(state, action.payload);
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
        const { tasksTotalCount, listId } = action.payload;

        listsAdapter.updateOne(state, { id: listId, changes: { tasksTotalCount } });
      });
  },
});

export const listsReducer = listsSlice.reducer;

export const {
  selectAll: selectAllLists,
  selectById: selectListById,
  selectIds: selectListsIds,
} = listsAdapter.getSelectors<RootStateType>(state => state.lists);

export const selectListTitle = createSelector(selectListById, list =>
  list ? list.title : 'list access error',
);

export const selectListsFetchStatus = (state: RootStateType): EntityLoadingStatusType =>
  state.lists.loading;

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
