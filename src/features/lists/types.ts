import type { EntityId } from '@reduxjs/toolkit';

import type { ListServerModelType, TodoListPutModelDataType } from 'services/api/types';

export type ListEntityAppType = ListServerModelType & {
  tasksTotalCount: number | null;
  tasks: EntityId[];
};

export type UpdateListThunkArgType = {
  listId: string;
  data: TodoListPutModelDataType;
};
