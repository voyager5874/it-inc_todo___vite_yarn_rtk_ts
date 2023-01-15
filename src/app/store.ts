import { configureStore } from '@reduxjs/toolkit';

import { appReducer } from './appSlice';

import { listsReducer } from 'features/lists';
import { tasksReducer } from 'features/tasks/tasksSlice';
import { todolistsReducer } from 'features/todolists/todolistsSlice';
import { userReducer } from 'features/user/userSlice';
import { listenerMiddleware } from 'middlewares/listenerMiddleware';

export const store = configureStore({
  reducer: {
    app: appReducer,
    user: userReducer,
    lists: listsReducer,
    tasks: tasksReducer,
    todolists: todolistsReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

// Since the listener middleware can receive "add" and "remove" actions containing functions, this should normally be
// added as the first middleware in the chain so that it is before the serializability check middleware
