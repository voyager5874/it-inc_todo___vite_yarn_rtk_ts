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

type DataSubmitThunkArgType = {
  listId: string;
  taskId: string;
  data: TasksEndpointPostPutModelDataType;
};

export type UpdateTaskThunkArgType = DataSubmitThunkArgType;

export type CreateTaskThunkArgType = Omit<DataSubmitThunkArgType, 'taskId'>;
