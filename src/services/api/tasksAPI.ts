import { normalizeGetTasksResponseData } from 'services/adapters/normalizeDateTimeString';
import { baseAxiosInstance } from 'services/api/axiosConfig';
import { SERVER_MAX_TASKS_PER_REQUEST } from 'services/api/constants';
import type {
  TaskEndpointDeleteResponseType,
  TaskEndpointPostPutResponseType,
  TasksEndpointGetResponseType,
  TasksEndpointPostPutModelDataType,
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
      .then(res => normalizeGetTasksResponseData(res.data));
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
  deleteTask(listId: string, taskId: string) {
    return baseAxiosInstance
      .delete<TaskEndpointDeleteResponseType>(`/todo-lists/${listId}/tasks/${taskId}`)
      .then(res => res.data);
  },
};
