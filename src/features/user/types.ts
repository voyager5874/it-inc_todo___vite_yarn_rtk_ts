import { createAsyncThunk } from '@reduxjs/toolkit';

import type { AppDispatchType, RootStateType } from 'app';
import type { FormFieldErrorType } from 'services/api/types';

export const createAuthAsyncThunk = createAsyncThunk.withTypes<{
  // rename to smth. like dataSubmitAsyncThunk and use also for app entities
  state: RootStateType;
  dispatch: AppDispatchType;
  rejectValue: { messages: string[]; fieldsErrors: FormFieldErrorType[] };
}>();

export type UserInAppType = {
  id: number | null;
  auth: boolean;
  login: string;
  name: string;
  email: string;
  photoLarge: string;
};
