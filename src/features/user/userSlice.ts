import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { UserInAppType } from 'features/user/types';
import { RequestResultCode } from 'services/api/enums';
import type { LoginParamsType, ProfileServerModelType } from 'services/api/types';
import { userAPI } from 'services/api/userAPI';
import { createDataSubmitAsyncThunk } from 'utils/typedThunkCreators';

export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async (id: number | string) => {
    return userAPI.fetchProfile(id);
  },
);

export const changeUserName = createDataSubmitAsyncThunk(
  'user/changeName',
  async (name: string, { rejectWithValue, getState }) => {
    const userData = getState().user.allUserData;
    const response = await userAPI.updateUserData({ ...userData, fullName: name });

    if (response.resultCode === RequestResultCode.Error) {
      return rejectWithValue({
        messages: response.messages,
        fieldsErrors: response.fieldsErrors,
      });
    }

    // server returns no data on success
    // return response.data;
    return { ...userData, fullName: name };
  },
);

export const authenticateUser = createDataSubmitAsyncThunk(
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

export const serviceLogin = createDataSubmitAsyncThunk(
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

export const serviceLogout = createDataSubmitAsyncThunk(
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
  about: '',
  email: '',
  photoLarge: '',
  auth: false,
  allUserData: {} as ProfileServerModelType,
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
        const { fullName, photos, aboutMe } = action.payload;

        state.allUserData = action.payload;
        state.name = fullName;
        state.about = aboutMe;
        state.photoLarge = photos.large;
      })
      .addCase(changeUserName.fulfilled, (state, action) => {
        const { fullName } = action.payload;

        state.name = fullName;
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
