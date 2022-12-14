import type { TaskPriority, TaskStatus } from 'services/api/enums';

export type UserAccountType = {
  id: number;
  login: string;
  email: string;
};

export type LoginParamsType = {
  email: string;
  password: string;
  rememberMe: boolean;
  captcha?: string;
};

export type ProfileServerModelType = {
  aboutMe: string;
  contacts: {
    facebook: string;
    website: string;
    vk: string;
    twitter: string;
    instagram: string;
    youtube: string;
    github: string;
    mainLink: string;
  };
  lookingForAJob: boolean;
  lookingForAJobDescription: string;
  fullName: string;
  userId: number;
  photos: {
    small: string;
    large: string;
  };
};

export type FormFieldErrorType = { field: string; error: string };

export type FormSubmitResponseType<D = {}> = {
  resultCode: number;
  messages: string[];
  fieldsErrors: FormFieldErrorType[];
  data: D;
};

export type TaskServerModelType = {
  id: string;
  title: string;
  description: string | null;
  todoListId: string;
  order: number;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string | null;
  deadline: string | null;
  addedDate: string | null;
};

export type TasksEndpointGetResponseType = {
  items: TaskServerModelType[];
  totalCount: number;
  error: string | null;
};

export type TasksEndpointPostPutModelDataType = {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: string | null;
  deadline?: string | null;
  order?: number;
};

export type TasksEndpointPostDataType = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: string | null;
  deadline?: string | null;
};

export type TasksEndpointPutDataType = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: string | null;
  deadline?: string | null;
};

export type TaskEndpointPostPutResponseType = FormSubmitResponseType<{
  item: TaskServerModelType;
}>;

export type TaskEndpointDeleteResponseType = FormSubmitResponseType;

export type ListServerModelType = {
  id: string;
  title: string;
  addedDate: string;
  order: number;
};

export type TodoListsEndpointGetResponseType = ListServerModelType[];

export type TodoListsEndpointPostResponseType = FormSubmitResponseType<{
  item: ListServerModelType;
}>;

export type TodoListsEndpointDeleteResponseType = FormSubmitResponseType;

export type TodoListPutModelDataType = {
  title: string;
  // order?: number;
};

export type TodoListEndpointPutResponseType = FormSubmitResponseType;

export type PutAvatarResponseType = {
  photos: {
    small: string;
    large: string;
  };
};
