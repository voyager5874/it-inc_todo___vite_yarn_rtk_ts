import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from 'app/hooks';
import { LoginForm } from 'pages/login/LoginForm';

export const LoginPage = (): ReactElement => {
  const auth = useAppSelector(state => state.user.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth) return;
    navigate('../lists', { replace: true });
  }, [auth, navigate]);

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={2}
      sx={{
        minHeight: '99vh',
      }}
    >
      <LoginForm />
    </Stack>
  );
};
