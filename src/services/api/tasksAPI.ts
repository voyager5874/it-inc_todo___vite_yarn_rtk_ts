import { baseAxiosInstance } from 'services/api/axiosConfig';
import type { TasksEndpointGetResponseType } from 'services/api/types';

export const tasksAPI = {
  getTasks(todolistId: string) {
    return baseAxiosInstance
      .get<TasksEndpointGetResponseType>(`todo-lists/${todolistId}/tasks`)
      .then(res => res.data);
  },
};
