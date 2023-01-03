import type { ListServerModelType, TodoListPutModelDataType } from 'services/api/types';

export type ListEntityAppType = ListServerModelType & {
  tasksTotalCount: number | null;
};

export type UpdateListThunkArgType = {
  listId: string;
  data: TodoListPutModelDataType;
};
