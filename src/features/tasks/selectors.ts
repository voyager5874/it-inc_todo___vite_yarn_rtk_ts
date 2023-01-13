import type { EntityId } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';

import type { RootStateType } from 'app';
import { tasksAdapter } from 'features/tasks/normalizrAdapter';
import { TaskPriority, TaskStatus } from 'services/api/enums';
import { createDummyTaskObject } from 'utils';

export const {
  selectAll: selectAllTasks,
  selectEntities: selectTasksEntities,
  selectById: selectTaskById,
  selectIds: selectTasksIds,
} = tasksAdapter.getSelectors<RootStateType>(state => state.tasks);

// export const selectTasksByListId = createSelector(
//   selectTasksEntities,
//   selectTasksIdsByListId,
//   (entities, ids) => {
//     if (!ids.length) return [];
//
//     return ids.map(id => entities[id] || createDummyTaskObject());
//   },
// );

export const selectTasksByListId = createSelector(
  selectTasksEntities,
  (state: RootStateType, listId: EntityId) =>
    state.lists.entities[listId]?.tasks || ['not a valid taskId'],
  (entities, ids) => {
    if (!ids.length) return [];

    return ids.map(
      id =>
        entities[id] || createDummyTaskObject({ title: 'error: selectTasksByListId' }),
    );
  },
);

// export const selectTasksByListId = (
//   state: RootStateType,
//   listId: string,
// ): TaskServerModelType[] => state.tasks.sortedByListId[listId] || [];

export const selectTasksByListIdSortedByTitle = createSelector(
  selectTasksByListId,
  tasks => {
    return tasks.sort((a, b) => a.title.localeCompare(b.title));
  },
);

// export const selectGoalTasks = createSelector(
//   [selectAllTasks, (state, goalId) => goalId],
//   (tasks, goalId) => tasks.filter(task => task.todoListId === goalId),
// );

// Adding a separate selector function for every single field is not a good idea!
// That ends up turning Redux into something resembling a Java class with getter/setter functions for every field.
// It's not going to improve the code, and it's probably going to make the code worse - maintaining all those extra
// selectors is a lot of additional effort, and it will be harder to trace what values are being used where.

// output selector should always have the transformation logic

export const selectTaskTitle = createSelector(selectTaskById, task => {
  console.log('taskTitleSelector', task);
  if (task) {
    console.log('taskTitleSelector', task.title);

    return task.title;
  }

  return 'selectTaskTitle: task access error';
});

export const selectTaskDescription = createSelector(selectTaskById, task =>
  task ? task.description : 'selectTaskDescription: task access error',
);

export const selectTaskDeadline = createSelector(selectTaskById, task =>
  task ? task.deadline : 'selectTaskDeadline: task access error',
);

export const selectTaskStartDate = createSelector(selectTaskById, task =>
  task ? task.startDate : 'selectTaskStartDate: task access error',
);

export const selectTaskPriority = createSelector(selectTaskById, task =>
  task ? task.priority : 'selectTaskPriority: task access error',
);

export const selectTaskStatus = createSelector(selectTaskById, task =>
  task ? task.status : 'selectTaskStatus: task access error',
);

export const selectTaskParentId = createSelector(selectTaskById, task =>
  task ? task.todoListId : 'selectTaskParentId: task access error',
);

export const selectCompletedTasksOfList = createSelector(selectTasksByListId, tasks =>
  tasks.length ? tasks.filter(task => task.status === TaskStatus.Completed) : [],
);

export const selectLowPriorityTasksOfList = createSelector(selectTasksByListId, tasks =>
  tasks.length ? tasks.filter(task => task.priority === TaskPriority.Low) : [],
);

export const selectHighPriorityTasksOfList = createSelector(selectTasksByListId, tasks =>
  tasks.length ? tasks.filter(task => task.priority === TaskPriority.High) : [],
);

export const selectTasksOfListByPriority = createSelector(
  selectTasksByListId,
  (state: RootStateType, priority: TaskPriority) => priority,
  (tasks, priority) =>
    tasks.length ? tasks.filter(task => task.priority === priority) : [],
);

export const selectAllCompletedTasks = createSelector(selectAllTasks, tasks =>
  tasks.length ? tasks.filter(task => task.status === TaskStatus.Completed) : [],
);

// export const selectTasksByListOfIds = createSelector(
//   selectTasksEntities,
//   (state: RootStateType, ids: EntityId[]) => ids,
//   (entities, ids) => {
//     if (!ids.length) return [];
//
//     return ids.map(id => entities[id] || createDummyTaskObject());
//     // .sort((a, b) => a.order - b.order);
//   },
// );

// export const selectTasksByListId = (state: RootStateType, listId: EntityId) => {
//   const taskIds = selectTasksIdsByListId(state, listId);
//
//   return selectTasksByListOfIds(state, taskIds);
// };
