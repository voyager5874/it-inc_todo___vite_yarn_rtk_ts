import { baseAxiosInstance } from './axiosConfig';

import type {
  TodoListsEndpointGetResponseType,
  TodoListsEndpointPostResponseType,
} from 'services/api/types';

export const goalsAPI = {
  getGoals() {
    return baseAxiosInstance
      .get<TodoListsEndpointGetResponseType>('todo-lists')
      .then(res => res.data);
  },
  createGoal(title: string) {
    return baseAxiosInstance
      .post<TodoListsEndpointPostResponseType>('todo-lists', { title })
      .then(res => res.data);
  },
  // createGoal(title: string) {
  //   const promise = instance.post<ResponseType<{ item: TodolistType }>>('todo-lists', {
  //     title,
  //   });
  //
  //   return promise;
  // },
  // deleteGoal(id: string) {
  //   const promise = instance.delete<ResponseType>(`todo-lists/${id}`);
  //
  //   return promise;
  // },
  // updateGoal(id: string, title: string) {
  //   const promise = instance.put<ResponseType>(`todo-lists/${id}`, { title });
  //
  //   return promise;
  // },
};
