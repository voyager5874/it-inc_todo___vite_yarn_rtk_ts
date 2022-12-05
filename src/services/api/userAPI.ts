import { baseApiInstance, extrasApiInstance } from './axiosConfig';

import {
  LoginParamsType,
  PutAvatarResponseType,
  ServerResponseType,
} from 'services/api/types';

export const userAPI = {
  login(data: LoginParamsType) {
    return baseApiInstance.post<ServerResponseType<{ userId?: number }>>(
      'auth/login',
      data,
    );
  },
  logout() {
    return baseApiInstance.delete<ServerResponseType<{ userId?: number }>>('auth/login');
  },
  me() {
    return baseApiInstance.get<
      ServerResponseType<{ id: number; email: string; login: string }>
    >('auth/me');
  },
  uploadAvatar(imgFile: File) {
    const formData = new FormData();

    formData.append('image', imgFile);

    return extrasApiInstance.put<ServerResponseType<PutAvatarResponseType>>(
      'profile/photo',
      formData,
    );
  },
};
