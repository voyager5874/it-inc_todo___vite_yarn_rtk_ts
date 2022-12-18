import type { ListServerModelType, TodoListPutModelDataType } from 'services/api/types';

export type ListEntityAppType = ListServerModelType;

export type UpdateListThunkArgType = {
  listId: string;
  data: TodoListPutModelDataType;
};
