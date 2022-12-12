import { configureStore } from '@reduxjs/toolkit';

import { appReducer } from './appSlice';

import { goalsReducer } from 'features/goals';
import { tasksReducer } from 'features/tasks/tasksSlice';
import { userReducer } from 'features/user/userSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    user: userReducer,
    goals: goalsReducer,
    tasks: tasksReducer,
  },
});
