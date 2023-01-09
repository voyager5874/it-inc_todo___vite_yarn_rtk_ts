import type { EntityId } from '@reduxjs/toolkit';
import type { AxiosRequestConfig } from 'axios';

import { normalizeTasksGetResponseData } from 'services/adapters/normalizeTasksEndpointResponses';
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
    listId: EntityId,
    count: string | number = SERVER_MAX_TASKS_PER_REQUEST,
    page: number | string = 1,
    config?: AxiosRequestConfig,
  ) {
    return baseAxiosInstance
      .get<TasksEndpointGetResponseType>(
        `todo-lists/${listId}/tasks?count=${count}&page=${page}`,
        config,
      )
      .then(res => normalizeTasksGetResponseData(res.data));
  },
  createTask(listId: EntityId, taskData: TasksEndpointPostPutModelDataType) {
    const data = clearObjectEmptyData(taskData);

    return baseAxiosInstance
      .post<TaskEndpointPostPutResponseType>(`todo-lists/${listId}/tasks`, data)
      .then(res => res.data);
  },
  updateTask(
    listId: EntityId,
    taskId: EntityId,
    taskData: TasksEndpointPostPutModelDataType,
  ) {
    const data = clearObjectEmptyData(taskData);

    return baseAxiosInstance
      .put<TaskEndpointPostPutResponseType>(`todo-lists/${listId}/tasks/${taskId}`, data)
      .then(res => res.data);
  },
  deleteTask(listId: EntityId, taskId: EntityId) {
    return baseAxiosInstance
      .delete<TaskEndpointDeleteResponseType>(`/todo-lists/${listId}/tasks/${taskId}`)
      .then(res => res.data);
  },
};
