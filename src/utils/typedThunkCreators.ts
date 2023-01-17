import { createAsyncThunk } from '@reduxjs/toolkit';

import type { AppDispatchType, RootStateType } from 'app';
import type { FormFieldErrorType } from 'services/api/types';

export const createDataSubmitAsyncThunk = createAsyncThunk.withTypes<{
  state: RootStateType;
  dispatch: AppDispatchType;
  rejectValue: {
    messages: string[];
    fieldsErrors: FormFieldErrorType[];
    prevState?: object;
  };
}>();
