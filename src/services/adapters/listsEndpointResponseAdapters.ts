import type { ListEntityAppType } from 'features/lists/types';
import type {
  FormSubmitResponseType,
  ListServerModelType,
  TodoListsEndpointGetResponseType,
  TodoListsEndpointPostResponseType,
} from 'services/api';

const addFieldsToListObject = (list: ListServerModelType): ListEntityAppType => {
  // Any references to individual items should be done by storing the item's ID
  // https://redux.js.org/usage/structuring-reducers/normalizing-state-shape
  return { ...list, tasksTotalCount: null, tasks: [] };
};

const addFieldsToAllLists = (lists: ListServerModelType[]): ListEntityAppType[] => {
  if (!lists.length) return [];

  return lists.map(addFieldsToListObject);
};

export const transformListGetResponse = (
  data: TodoListsEndpointGetResponseType,
): ListEntityAppType[] => {
  return addFieldsToAllLists(data);
};

export const transformListsPostResponse = (
  rawData: TodoListsEndpointPostResponseType,
): FormSubmitResponseType<{ item: ListEntityAppType }> => {
  return {
    ...rawData,
    data: { item: addFieldsToListObject(rawData.data.item) },
  };
};
