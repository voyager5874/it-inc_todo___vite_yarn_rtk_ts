import { baseAxiosInstance, extrasAxiosInstance } from './axiosConfig';

import type {
  ProfileServerModelType,
  FormSubmitResponseType,
  UserAccountType,
  LoginParamsType,
  PutAvatarResponseType,
} from 'services/api/types';

export const userAPI = {
  login(data: LoginParamsType) {
    return baseAxiosInstance
      .post<FormSubmitResponseType<{ userId?: number }>>('auth/login', data)
      .then(res => res.data);
  },
  logout() {
    return baseAxiosInstance
      .delete<FormSubmitResponseType>('auth/login')
      .then(res => res.data);
  },
  // async me() {
  //   const res = await baseAxiosInstance.get<
  //     AuthEndpointResponseType<BaseApiUserDataType>
  //   >('auth/me');
  //
  //   if (res.data.resultCode === RequestResultCode.Success) {
  //     return res.data.data;
  //   }
  //   // eslint-disable-next-line @typescript-eslint/no-throw-literal
  //   throw {
  //     errors: res.data.messages,
  //     fieldsErrors: res.data.fieldsErrors,
  //   };
  // },
  authMe() {
    return baseAxiosInstance
      .get<FormSubmitResponseType<UserAccountType>>('auth/me')
      .then(res => res.data);
  },
  fetchProfile(id: number | string) {
    return extrasAxiosInstance
      .get<ProfileServerModelType>(`profile/${id}`)
      .then(res => res.data);
  },
  uploadAvatar(imgFile: File) {
    const formData = new FormData();

    formData.append('image', imgFile);

    return extrasAxiosInstance.put<FormSubmitResponseType<PutAvatarResponseType>>(
      'profile/photo',
      formData,
    );
  },
};
