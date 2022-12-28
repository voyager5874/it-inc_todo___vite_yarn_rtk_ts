import type {
  TasksEndpointPostPutModelDataType,
  TaskServerModelType,
} from 'services/api/types';

export type TaskEntityAppType = TaskServerModelType;

// export type CreateTaskThunkArgType = {
//   goalId: string;
//   data: TaskEndpointPostPutModelDataType;
// };
//
// export type UpdateTaskThunkArgType = {
//   goalId: string;
//   taskId: string;
//   data: TaskEndpointPostPutModelDataType;
// };

// type DataSubmitThunkArgType = {
//   listId: string;
//   taskId: string;
//   data: Partial<TasksEndpointPostPutModelDataType>;
// title is obligatory for put requests,
// this resolves within thunk
// };

export type UpdateTaskThunkArgType = {
  listId: string;
  taskId: string;
  data: Partial<TasksEndpointPostPutModelDataType>;
};

// export type CreateTaskThunkArgType = Omit<DataSubmitThunkArgType, 'taskId'>;
export type CreateTaskThunkArgType = {
  listId: string;
  data: TasksEndpointPostPutModelDataType;
};
