import type { ListEntityAppType } from 'features/lists/types';
import type {
  FormSubmitResponseType,
  ListServerModelType,
  TodoListsEndpointGetResponseType,
  TodoListsEndpointPostResponseType,
} from 'services/api';

const addFieldsToListObject = (list: ListServerModelType): ListEntityAppType => {
  return { ...list, tasksTotalCount: null, tasks: [] };
};

const addFieldsToAllLists = (lists: ListServerModelType[]): ListEntityAppType[] => {
  if (!lists.length) return [];

  return lists.map(addFieldsToListObject);
};

export const normalizeListGetResponse = (
  data: TodoListsEndpointGetResponseType,
): ListEntityAppType[] => {
  return addFieldsToAllLists(data);
};

export const normalizeListsPostResponseData = (
  rawData: TodoListsEndpointPostResponseType,
): FormSubmitResponseType<{ item: ListEntityAppType }> => {
  return {
    ...rawData,
    data: { item: addFieldsToListObject(rawData.data.item) },
  };
};
