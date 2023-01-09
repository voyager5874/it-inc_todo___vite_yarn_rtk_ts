import type { EntityState } from '@reduxjs/toolkit';
import { createEntityAdapter, nanoid } from '@reduxjs/toolkit';

import type { TaskServerModelType } from 'services/api';

export const createDummyTaskObject = (): TaskServerModelType => {
  const dateTime = new Date(0).toISOString();
  const task: TaskServerModelType = {
    id: nanoid(),
    todoListId: nanoid(),
    deadline: dateTime,
    startDate: dateTime,
    addedDate: dateTime,
    title: 'this task is a sign of some error',
    description: 'error. No real data was found and passed',
    priority: 0,
    order: 0,
    status: 0,
  };

  return task;
};

export const createDummyListOfDummyTasks = (count: number): TaskServerModelType[] => {
  const res = [];

  for (let i = 0; i < count; i += 1) {
    res.push(createDummyTaskObject());
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
