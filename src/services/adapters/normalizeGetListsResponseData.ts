import type { ListEntityAppType } from 'features/lists/types';
import type {
  FormSubmitResponseType,
  ListServerModelType,
  TodoListsEndpointGetResponseType,
  TodoListsEndpointPostResponseType,
} from 'services/api';

const addTasksTotalCountField = (list: ListServerModelType): ListEntityAppType => {
  return { ...list, tasksTotalCount: null };
};

const addTasksTotalCountFieldToAllTasks = (
  lists: ListServerModelType[],
): ListEntityAppType[] => {
  if (!lists.length) return [];

  return lists.map(addTasksTotalCountField);
};

export const normalizeGetListsResponseData = (
  data: TodoListsEndpointGetResponseType,
): ListEntityAppType[] => {
  return addTasksTotalCountFieldToAllTasks(data);
};

export const normalizeListsPostResponseData = (
  rawData: TodoListsEndpointPostResponseType,
): FormSubmitResponseType<{ item: ListEntityAppType }> => {
  return {
    ...rawData,
    data: { item: addTasksTotalCountField(rawData.data.item) },
  };
};
