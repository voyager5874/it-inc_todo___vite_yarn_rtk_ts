import type { EntityState } from '@reduxjs/toolkit';
import { createEntityAdapter, nanoid } from '@reduxjs/toolkit';

import type { ListEntityAppType } from 'features/lists/types';
import type { TaskServerModelType } from 'services/api';

export const createDummyTaskObject = (
  data: Partial<TaskServerModelType> = {},
): TaskServerModelType => {
  const dateTime = new Date(0).toISOString();
  // const deadline = addDays(new Date(), 365).toISOString();

  return {
    id: nanoid(),
    todoListId: nanoid(),
    deadline: null,
    startDate: dateTime,
    addedDate: dateTime,
    title: 'this task is a sign of some error',
    description: 'error. No real data was found and passed',
    priority: 0,
    order: 0,
    status: 0,
    ...data,
  };
};

export const createDummyListOfDummyTasks = (
  count: number,
  data: Partial<TaskServerModelType> = {},
): TaskServerModelType[] => {
  const res = [];

  for (let i = 0; i < count; i += 1) {
    res.push(createDummyTaskObject(data));
  }

  return res;
};

const tasksStub = createDummyListOfDummyTasks(2);

export const createDummyTasksEntityState = (
  tasks: TaskServerModelType[] = tasksStub,
): EntityState<TaskServerModelType> => {
  const adapter = createEntityAdapter<TaskServerModelType>();
  const state = adapter.getInitialState();

  adapter.setAll(state, tasks);

  return state;
};

export const createDummyListObject = (
  data: Partial<ListEntityAppType> = {},
): ListEntityAppType => {
  const listId = nanoid();
  const dateTime = new Date(0).toISOString();

  return {
    tasks: ['error', 'error'],
    addedDate: dateTime,
    order: 0,
    tasksTotalCount: 2,
    title: 'this list object is a safe default and is a sign of some error',
    id: listId,
    ...data,
  };
};
