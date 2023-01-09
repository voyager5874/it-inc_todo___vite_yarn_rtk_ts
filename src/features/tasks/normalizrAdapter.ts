import { createEntityAdapter } from '@reduxjs/toolkit';

import type { TaskServerModelType } from 'services/api';

export const tasksAdapter = createEntityAdapter<TaskServerModelType>({
  // selectId: task => task.todoListId,
  sortComparer: (a, b) => a.order - b.order,
});
