import { configureStore } from '@reduxjs/toolkit';

import { appReducer } from './appSlice';

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
});
