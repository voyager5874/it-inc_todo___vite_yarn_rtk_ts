import { baseAxiosInstance } from 'services/api/axiosConfig';
import { SERVER_MAX_TASKS_PER_REQUEST } from 'services/api/constants';
import type {
  TaskEndpointPostPutModelDataType,
  TaskEndpointPostPutResponseType,
  TasksEndpointGetResponseType,
} from 'services/api/types';
import { clearObjectEmptyData } from 'utils/clearObjectEmptyData';

export const tasksAPI = {
  getTasks(
    goalId: string,
    count: string | number = SERVER_MAX_TASKS_PER_REQUEST,
    page: number | string = 1,
  ) {
    return baseAxiosInstance
      .get<TasksEndpointGetResponseType>(
        `todo-lists/${goalId}/tasks?count=${count}&page=${page}`,
      )
      .then(res => res.data);
  },
  createTask(goalId: string, taskData: TaskEndpointPostPutModelDataType) {
    const data = clearObjectEmptyData(taskData);

    return baseAxiosInstance
      .post<TaskEndpointPostPutResponseType>(`todo-lists/${goalId}/tasks`, data)
      .then(res => res.data);
  },
  updateTask(goalId: string, taskId: string, taskData: TaskEndpointPostPutModelDataType) {
    const data = clearObjectEmptyData(taskData);

    return baseAxiosInstance
      .put<TaskEndpointPostPutResponseType>(`todo-lists/${goalId}/tasks/${taskId}`, data)
      .then(res => res.data);
  },
};
