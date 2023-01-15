import type { MouseEvent, ReactElement } from 'react';
import { useState } from 'react';

import { Login, Visibility, VisibilityOff } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { isRejectedWithValue } from '@reduxjs/toolkit';
import { useFormik } from 'formik';

// import * as yup from 'yup';
import { serviceLogin } from 'features/user/userSlice';
import { useAppDispatch } from 'hooks/redux';
import type { LoginParamsType } from 'services/api/types';

// const validationSchema = yup.object({
//   email: yup.string().email('Enter a valid email').required('Email is required'),
//   password: yup
//     .string()
//     // .min(8, 'Password should be of minimum 8 characters length')
//     .required('Password is required'),
// });

const initialValues: LoginParamsType = {
  email: import.meta.env.VITE_MY_EMAIL || 'free@samuraijs.com',
  password: import.meta.env.VITE_MY_PASSWORD || 'free',
  rememberMe: true,
};

export const LoginForm = (): ReactElement => {
  // const serverErrorMessage = useRef<string>('');
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues,
    // validationSchema,
    onSubmit: async (values, helpers) => {
      // helpers.setSubmitting(true);
      const res = await dispatch(serviceLogin(values));

      if (isRejectedWithValue(res)) {
        if (res?.payload?.fieldsErrors.length) {
          res.payload.fieldsErrors.forEach(fe => {
            helpers.setFieldError(fe.field, fe.error);
          });
        }

        // serverErrorMessage.current = res?.payload?.messages.join(', ') || '';
        if (res?.payload?.messages.length)
          helpers.setStatus(res.payload.messages.join(', ') || '');
      }
      helpers.setSubmitting(false);
    },
  });

  const toggleShowPassword = (
    e: MouseEvent<HTMLAnchorElement> | MouseEvent<HTMLButtonElement>,
  ): void => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const resetErrorMessage = (): void => {
    if (formik.status) {
      // serverErrorMessage.current = '';
      formik.setStatus('');
    }
  };

  return (
    <Box>
      <form
        onSubmit={formik.handleSubmit}
        style={{
          width: '500px',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
        }}
      >
        <TextField
          fullWidth
          id="email"
          // name="email"
          label="Email"
          // value={formik.values.email}
          // onChange={formik.handleChange}
          // onBlur={formik.handleBlur}
          {...formik.getFieldProps('email')}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          onKeyDown={resetErrorMessage}
        />
        <TextField
          fullWidth
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          {...formik.getFieldProps('password')}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          onKeyDown={resetErrorMessage}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={toggleShowPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {/* <FormControl sx={{ m: 1 }} variant="outlined"> */}
        {/*  <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel> */}
        {/*  <OutlinedInput */}
        {/*    id="outlined-adornment-password" */}
        {/*    type={showPassword ? 'text' : 'password'} */}
        {/*    value={formik.values.password} */}
        {/*    onChange={formik.handleChange} */}
        {/*    endAdornment={ */}
        {/*      <InputAdornment position="end"> */}
        {/*        <IconButton */}
        {/*          aria-label="toggle password visibility" */}
        {/*          onClick={toggleShowPassword} */}
        {/*          onMouseDown={handleMouseDownPassword} */}
        {/*          edge="end" */}
        {/*        > */}
        {/*          {showPassword ? <VisibilityOff /> : <Visibility />} */}
        {/*        </IconButton> */}
        {/*      </InputAdornment> */}
        {/*    } */}
        {/*    label="Password" */}
        {/*  /> */}
        {/* </FormControl> */}
        <FormControlLabel
          control={
            <Checkbox
              name="rememberMe"
              onChange={formik.handleChange}
              checked={formik.values.rememberMe}
            />
          }
          label="remember me"
        />
        {/* <Button */}
        {/*  color="primary" */}
        {/*  variant="contained" */}
        {/*  fullWidth */}
        {/*  type="submit" */}
        {/*  disabled={formik.isSubmitting} */}
        {/* > */}
        {/*  Login */}
        {/* </Button> */}
        <LoadingButton
          loadingPosition="start"
          startIcon={<Login />}
          color="primary"
          variant="contained"
          fullWidth
          type="submit"
          disabled={formik.isSubmitting}
          loading={formik.isSubmitting}
        >
          Login
        </LoadingButton>
      </form>
      <Typography
        variant="body2"
        mt={4}
        sx={{ height: '1.5em', textAlign: 'center', color: 'red' }}
      >
        {/* {serverErrorMessage.current} */}
        {formik.status}
      </Typography>
    </Box>
  );
};
