import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // app: appReducer,
    // user: userReducer,
    // goals: goalsReducer,
    // tasks: tasksReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
