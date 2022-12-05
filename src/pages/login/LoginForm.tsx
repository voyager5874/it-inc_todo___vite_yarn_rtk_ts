import { ReactElement } from 'react';

import { Button, TextField } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { LoginParamsType } from 'services/api/types';

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup
    .string()
    // .min(8, 'Password should be of minimum 8 characters length')
    .required('Password is required'),
});

const initialValues: LoginParamsType = {
  email: '',
  password: '',
  rememberMe: true,
};

export const LoginForm = (): ReactElement => {
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: values => {
      // eslint-disable-next-line no-magic-numbers,no-alert
      alert(JSON.stringify(values, null, 2));
    },
  });

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email"
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        <TextField
          fullWidth
          id="password"
          name="password"
          label="Password"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
        />
        <Button color="primary" variant="contained" fullWidth type="submit">
          Submit
        </Button>
      </form>
    </div>
  );
};
