import { baseAxiosInstance } from './axiosConfig';

import type {
  TodoListsEndpointDeleteResponseType,
  TodoListsEndpointGetResponseType,
  TodoListsEndpointPostResponseType,
} from 'services/api/types';

export const listsAPI = {
  getLists() {
    return baseAxiosInstance
      .get<TodoListsEndpointGetResponseType>('todo-lists')
      .then(res => res.data);
  },
  createList(title: string) {
    return baseAxiosInstance
      .post<TodoListsEndpointPostResponseType>('todo-lists', { title })
      .then(res => res.data);
  },
  deleteList(id: string) {
    return baseAxiosInstance
      .delete<TodoListsEndpointDeleteResponseType>(`todo-lists/${id}`)
      .then(res => res.data);
  },
  // updateGoal(id: string, title: string) {
  //   const promise = instance.put<ResponseType>(`todo-lists/${id}`, { title });
  //
  //   return promise;
  // },
};
