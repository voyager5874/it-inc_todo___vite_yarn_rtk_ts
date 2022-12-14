import type { AxiosRequestConfig } from 'axios';

import { baseAxiosInstance } from './axiosConfig';

import {
  normalizeGetListsResponseData,
  normalizeListsPostResponseData,
} from 'services/adapters/normalizeGetListsResponseData';
import type {
  TodoListEndpointPutResponseType,
  TodoListPutModelDataType,
  TodoListsEndpointDeleteResponseType,
  TodoListsEndpointGetResponseType,
  TodoListsEndpointPostResponseType,
} from 'services/api/types';

export const listsAPI = {
  getLists(config?: AxiosRequestConfig) {
    return baseAxiosInstance
      .get<TodoListsEndpointGetResponseType>('todo-lists', config)
      .then(res => normalizeGetListsResponseData(res.data));
  },
  createList(title: string) {
    return baseAxiosInstance
      .post<TodoListsEndpointPostResponseType>('todo-lists', { title })
      .then(res => normalizeListsPostResponseData(res.data));
  },
  deleteList(id: string) {
    return baseAxiosInstance
      .delete<TodoListsEndpointDeleteResponseType>(`todo-lists/${id}`)
      .then(res => res.data);
  },
  updateList(id: string, data: TodoListPutModelDataType) {
    return baseAxiosInstance
      .put<TodoListEndpointPutResponseType>(`todo-lists/${id}`, data)
      .then(res => res.data);
  },
};
