import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { UserInAppType } from 'features/user/types';
import { createAuthAsyncThunk } from 'features/user/types';
import { RequestResultCode } from 'services/api/enums';
import type { LoginParamsType } from 'services/api/types';
import { userAPI } from 'services/api/userAPI';

// export const authorizeUser = createAuthAsyncThunk(
//   'user/auth',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await userAPI.authMe();
//
//       if (response.resultCode === RequestResultCode.Success) {
//         return response.data;
//       }
//       rejectWithValue({
//         messages: response.messages,
//         fieldsErrors: response.fieldsErrors,
//       });
//     } catch (error) {
//       rejectWithValue({
//         messages: [isAxiosError(error) ? error.message : 'network error'],
//         fieldsErrors: [],
//       });
//     }
//   },
// );

export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async (id: number | string) => {
    return userAPI.fetchProfile(id);
  },
);

export const authenticateUser = createAuthAsyncThunk(
  'user/auth',
  async (_, { rejectWithValue, dispatch }) => {
    const response = await userAPI.authMe();

    if (response.resultCode === RequestResultCode.Error) {
      return rejectWithValue({
        messages: response.messages,
        fieldsErrors: response.fieldsErrors,
      });
    }
    dispatch(fetchProfile(response.data.id));

    return response.data;
  },
);

export const serviceLogin = createAuthAsyncThunk(
  'user/login',
  async (accountData: LoginParamsType, { dispatch, rejectWithValue }) => {
    const response = await userAPI.login(accountData);

    if (response.resultCode === RequestResultCode.Error) {
      return rejectWithValue({
        messages: response.messages,
        fieldsErrors: response.fieldsErrors,
      });
    }
    dispatch(authenticateUser());

    return response.data;
  },
);

export const serviceLogout = createAuthAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    const response = await userAPI.logout();

    if (response.resultCode === RequestResultCode.Error) {
      return rejectWithValue({
        messages: response.messages,
        fieldsErrors: response.fieldsErrors,
      });
    }

    return response.data;
  },
);

const initialState: UserInAppType = {
  id: null,
  login: '',
  name: '',
  email: '',
  photoLarge: '',
  auth: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(authenticateUser.fulfilled, (state, action) => {
        const { id, login, email } = action.payload;

        state.id = id;
        state.login = login;
        state.email = email;
        state.auth = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.name = action.payload.fullName;
        state.photoLarge = action.payload.photos.large;
      })
      .addCase(serviceLogout.fulfilled, () => {
        return initialState;
      })
      .addCase(serviceLogin.rejected, (state, action) => {
        console.log(
          'serviceLogin.rejected ->  action.payload?.messages',
          action.payload?.messages,
        );
        console.log('serviceLogin.rejected ->  SerializedError', action.error);
        state.auth = false;

        return initialState;
      })
      .addCase(authenticateUser.rejected, (state, action) => {
        state.auth = false;
        console.log('authenticateUser.rejected ->  SerializedError', action.error);

        return initialState;
      });
  },
});

export const userReducer = userSlice.reducer;
