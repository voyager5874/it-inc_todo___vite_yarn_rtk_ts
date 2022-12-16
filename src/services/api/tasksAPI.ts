import { baseAxiosInstance } from 'services/api/axiosConfig';
import { SERVER_MAX_TASKS_PER_REQUEST } from 'services/api/constants';
import type {
  TasksEndpointPostPutModelDataType,
  TaskEndpointPostPutResponseType,
  TasksEndpointGetResponseType,
} from 'services/api/types';
import { clearObjectEmptyData } from 'utils/clearObjectEmptyData';

export const tasksAPI = {
  getTasks(
    listId: string,
    count: string | number = SERVER_MAX_TASKS_PER_REQUEST,
    page: number | string = 1,
  ) {
    return baseAxiosInstance
      .get<TasksEndpointGetResponseType>(
        `todo-lists/${listId}/tasks?count=${count}&page=${page}`,
      )
      .then(res => res.data);
  },
  createTask(listId: string, taskData: TasksEndpointPostPutModelDataType) {
    const data = clearObjectEmptyData(taskData);

    return baseAxiosInstance
      .post<TaskEndpointPostPutResponseType>(`todo-lists/${listId}/tasks`, data)
      .then(res => res.data);
  },
  updateTask(
    listId: string,
    taskId: string,
    taskData: TasksEndpointPostPutModelDataType,
  ) {
    const data = clearObjectEmptyData(taskData);

    return baseAxiosInstance
      .put<TaskEndpointPostPutResponseType>(`todo-lists/${listId}/tasks/${taskId}`, data)
      .then(res => res.data);
  },
};
