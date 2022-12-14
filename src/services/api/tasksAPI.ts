import { baseAxiosInstance } from 'services/api/axiosConfig';
import type { TasksEndpointGetResponseType } from 'services/api/types';

export const tasksAPI = {
  getTasks(todolistId: string, count: string | number = 100, page: number | string = 1) {
    return baseAxiosInstance
      .get<TasksEndpointGetResponseType>(
        `todo-lists/${todolistId}/tasks?count=${count}&page=${page}`,
      )
      .then(res => res.data);
  },
};
