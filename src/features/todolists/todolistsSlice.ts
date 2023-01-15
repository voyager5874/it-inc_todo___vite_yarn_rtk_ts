import type { EntityId } from '@reduxjs/toolkit';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import axios from 'axios';

import type { AppThunkApiType, EntityLoadingStatusType, RootStateType } from 'app';
import { MAX_REQUEST_ATTEMPTS } from 'constants/settings';
import type { ListEntityAppType } from 'features/lists/types';
import type { CreateTaskThunkArgType } from 'features/tasks/types';
import type { TodolistEntryType } from 'features/todolists/types';
import { startAppListening } from 'middlewares/listenerMiddleware';
import type { TaskServerModelType } from 'services/api';
import { SERVER_MAX_TASKS_PER_REQUEST } from 'services/api/constants';
import { RequestResultCode } from 'services/api/enums';
import { listsAPI } from 'services/api/listsAPI';
import { tasksAPI } from 'services/api/tasksAPI';
import {
  createDataSubmitAsyncThunk,
  createDummyListOfDummyTasks,
  createDummyTaskObject,
} from 'utils';

const listsAdapter = createEntityAdapter<TodolistEntryType>({
  sortComparer: (a, b) => b.order - a.order,
});

const tasksAdapter = createEntityAdapter<TaskServerModelType>({
  sortComparer: (a, b) => b.order - a.order,
});

export const {
  selectAll: selectAllLists,
  selectById: selectListById,
  selectIds: selectListsIds,
} = listsAdapter.getSelectors<RootStateType>(state => state.todolists);

const tasksAdapterSelectors = tasksAdapter.getSelectors();

export const selectAllTasksByListId = createSelector(selectListById, list => {
  if (list) {
    return tasksAdapterSelectors.selectAll(list.tasks);
  }

  return createDummyListOfDummyTasks(3);
});

export const selectTasksIdsByListId = createSelector(selectListById, list => {
  if (list) return tasksAdapterSelectors.selectIds(list.tasks);
});

export const selectTaskById = createSelector(
  selectListById,
  (state: RootStateType, listId: EntityId, taskId: EntityId) => taskId,
  (list, taskId) => {
    if (list) {
      const res = tasksAdapterSelectors.selectById(list.tasks, taskId);

      return res || createDummyTaskObject();
    }

    return createDummyTaskObject();
  },
);

export const {
  selectEntities: localSelectTodolistsEntities,
  selectAll: localSelectAllLists,
  selectById: localSelectListById,
  selectIds: localSelectListsIds,
} = listsAdapter.getSelectors();

// const selectTasksEntityStateByListId = createDraftSafeSelector(
//   localSelectListById,
//   list => {
//     if (list) {
//       return list.tasks;
//     }
//
//     // return createDummyTasksEntityState();
//   },
// );

const initialState = listsAdapter.getInitialState({
  loading: 'idle' as EntityLoadingStatusType,
  fetchAttempts: 0,
});

export const fetchListsTodosSlice = createAsyncThunk<
  ListEntityAppType[],
  undefined,
  AppThunkApiType
>(
  'todolists/fetchLists',
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
      const { todolists, user } = getState();
      const fetchStatus = todolists.loading;
      const { auth } = user;

      if (fetchStatus === 'succeeded' || fetchStatus === 'loading' || !auth) {
        return false;
      }
    },
  },
);

export const fetchTasksTodosSlice = createAsyncThunk<
  { tasks: TaskServerModelType[]; tasksTotalCount: number },
  EntityId,
  AppThunkApiType
>(
  'todolists/fetchTasks',
  async (id, { signal }) => {
    const source = axios.CancelToken.source();

    signal.addEventListener('abort', () => {
      // dispatch(tasksSlice.actions.fetchTasksOfListRequestEnded({ listId: id }));
      source.cancel();
    });
    // dispatch(tasksOfListRequested(id));
    const response = await tasksAPI.getTasks(id, SERVER_MAX_TASKS_PER_REQUEST, 1, {
      cancelToken: source.token,
    });

    // I could create adapter for the API to get this (or even more slice-like) data shape
    // and just return it here
    return { tasks: response.items, tasksTotalCount: response.totalCount };
  },
  {
    // condition: (id, { getState }) => {
    //   const requested = getState().tasks.loading;
    //
    //   if (requested.includes(id)) return false;
    //
    //   const tasks = selectTasksByListId(getState(), id);
    //   const list = selectListById(getState(), id);
    //   const taskCountReceived = tasks.length;
    //   // const taskCountReceived = tasks?.sortedByListId[id].length || null; // I have the selector
    //   const tasksCountTotal = list?.tasksTotalCount;
    //
    //   if (tasksCountTotal !== null && tasksCountTotal === taskCountReceived) {
    //     return false;
    //   }
    // },
  },
);

export const addTaskTodosSlice = createDataSubmitAsyncThunk(
  'todolists/addTask',
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

export const todolistsSlice = createSlice({
  name: 'todolists',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchListsTodosSlice.pending, state => {
        if (state.loading !== 'loading') {
          state.fetchAttempts += 1;
          state.loading = 'loading';
        }
      })
      .addCase(fetchTasksTodosSlice.pending, (state, action) => {
        const listId = action.meta.arg;
        const todolistEntry = state.entities[listId];

        if (todolistEntry && todolistEntry.tasks.loading !== 'loading') {
          todolistEntry.tasks.loading = 'loading';
        }
      })
      .addCase(fetchListsTodosSlice.rejected, state => {
        if (state.loading !== 'failed') {
          state.loading = 'failed';
        }
      })
      .addCase(fetchListsTodosSlice.fulfilled, (state, action) => {
        const todolistsEntries: TodolistEntryType[] = action.payload.map(todolist => {
          return {
            ...todolist,
            tasks: tasksAdapter.getInitialState({
              loading: 'idle' as EntityLoadingStatusType,
            }),
          };
        });

        listsAdapter.setAll(state, todolistsEntries);
      })
      .addCase(fetchTasksTodosSlice.fulfilled, (state, action) => {
        const listId = action.meta.arg;
        const todolistEntry = state.entities[listId];

        if (todolistEntry) {
          // We specifically recommend that Redux apps should keep the Redux state minimal,
          // and derive additional values from that state whenever possible.
          // https://redux.js.org/usage/deriving-data-selectors
          todolistEntry.tasksTotalCount = action.payload.tasksTotalCount;
          tasksAdapter.setAll(todolistEntry.tasks, action.payload.tasks);
        }
      })
      .addCase(addTaskTodosSlice.fulfilled, (state, action) => {
        const { listId, taskData } = action.payload;
        const tasksEntityStateOfList = state.entities[listId]?.tasks;
        // const list = localSelectListById(state, listId)
        // const tasksEntityStateOfList = selectTasksEntities(list)
        // const tasksEntityStateOfList = selectTasksEntityStateByListId(state, listId);

        if (tasksEntityStateOfList) {
          tasksAdapter.addOne(tasksEntityStateOfList, taskData);
        }
      });
  },
});

startAppListening({
  predicate: action => {
    return fetchListsTodosSlice.rejected.match(action);
  },
  effect: (action, { dispatch, getState, unsubscribe }) => {
    dispatch(fetchListsTodosSlice());
    if (getState().todolists.fetchAttempts > MAX_REQUEST_ATTEMPTS) {
      unsubscribe();
    }
  },
});

startAppListening({
  predicate: action => {
    return fetchListsTodosSlice.fulfilled.match(action);
  },
  effect: async (action, { dispatch, getState }) => {
    const lists = selectListsIds(getState());

    lists.forEach(listId => {
      dispatch(fetchTasksTodosSlice(listId));
    });
  },
});

export const todolistsReducer = todolistsSlice.reducer;
