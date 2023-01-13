import type { EntityId } from '@reduxjs/toolkit';
import type { AxiosRequestConfig } from 'axios';

import { baseAxiosInstance } from './axiosConfig';

import {
  transformListGetResponse,
  transformListsPostResponse,
} from 'services/adapters/listsEndpointResponseAdapters';
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
      .then(res => transformListGetResponse(res.data));
  },
  createList(title: string) {
    return baseAxiosInstance
      .post<TodoListsEndpointPostResponseType>('todo-lists', { title })
      .then(res => transformListsPostResponse(res.data));
  },
  deleteList(id: EntityId) {
    return baseAxiosInstance
      .delete<TodoListsEndpointDeleteResponseType>(`todo-lists/${id}`)
      .then(res => res.data);
  },
  updateList(id: EntityId, data: TodoListPutModelDataType) {
    return baseAxiosInstance
      .put<TodoListEndpointPutResponseType>(`todo-lists/${id}`, data)
      .then(res => res.data);
  },
};
