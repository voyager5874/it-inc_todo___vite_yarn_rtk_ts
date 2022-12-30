import type { MouseEvent, ReactElement } from 'react';
import { useState } from 'react';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { useAppDispatch } from 'app/hooks';
import { serviceLogin } from 'features/user/userSlice';
import type { LoginParamsType } from 'services/api/types';

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup
    .string()
    // .min(8, 'Password should be of minimum 8 characters length')
    .required('Password is required'),
});

const initialValues: LoginParamsType = {
  email: import.meta.env.VITE_MY_EMAIL || 'free@samuraijs.com',
  password: import.meta.env.VITE_MY_PASSWORD || 'free',
  rememberMe: true,
};

export const LoginForm = (): ReactElement => {
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers) => {
      // helpers.setSubmitting(true);
      await dispatch(serviceLogin(values));
      helpers.setSubmitting(false);
    },
  });

  const toggleShowPassword = (): void => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
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
          name="email"
          label="Email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        <TextField
          fullWidth
          id="password"
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {' '}
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={toggleShowPassword}
                  onMouseDown={handleMouseDownPassword}
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
        <Button
          color="primary"
          variant="contained"
          fullWidth
          type="submit"
          disabled={formik.isSubmitting}
        >
          Submit
        </Button>
      </form>
    </Box>
  );
};
