import type { PayloadAction } from '@reduxjs/toolkit';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';

import type { EntityLoadingStatusType, RootStateType } from 'app';
import type { UpdateListThunkArgType } from 'features/lists/types';
import type { ListServerModelType } from 'services/api';
import { RequestResultCode } from 'services/api/enums';
import { listsAPI } from 'services/api/listsAPI';
import { createDataSubmitAsyncThunk } from 'utils/createDataSubmitAsyncThunk';

const listsAdapter = createEntityAdapter<ListServerModelType>({
  sortComparer: (a, b) => b.order - a.order,
});

export const fetchLists = createAsyncThunk('lists/fetchLists', async () => {
  return listsAPI.getLists();
});

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
  loading: 'idle' as EntityLoadingStatusType,
});

const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    listAdded: listsAdapter.addOne,
    listsReceived(state, action: PayloadAction<{ lists: ListServerModelType[] }>) {
      listsAdapter.setAll(state, action.payload.lists);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchLists.fulfilled, (state, action) => {
        listsAdapter.setAll(state, action.payload);
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
