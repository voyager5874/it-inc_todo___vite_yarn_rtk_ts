import { configureStore } from '@reduxjs/toolkit';

import { appReducer } from './appSlice';

import { listenerMiddleware } from 'app/listenerMiddleware';
import { listsReducer } from 'features/lists';
import { tasksReducer } from 'features/tasks/tasksSlice';
import { userReducer } from 'features/user/userSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    user: userReducer,
    lists: listsReducer,
    tasks: tasksReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

// Since the listener middleware can receive "add" and "remove" actions containing functions, this should normally be
// added as the first middleware in the chain so that it is before the serializability check middleware
