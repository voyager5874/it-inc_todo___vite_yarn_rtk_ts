import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { Link, Stack, Typography } from '@mui/material';
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
      <Stack
        justifyContent="flex-start"
        gap={1.5}
        mb={3}
        sx={{ textAlign: 'left', minWidth: '30em' }}
      >
        <Typography variant="body1">
          Register at&nbsp;
          <Link
            href="https://social-network.samuraijs.com/"
            target="_blank"
            rel="noreferrer"
          >
            social-network.samuraijs.com
          </Link>
        </Typography>
        <Typography variant="body1">or use test account credentials:</Typography>
        <Typography variant="body1">email: free@samuraijs.com</Typography>
        <Typography variant="body1">password: free</Typography>
      </Stack>

      <LoginForm />
    </Stack>
  );
};
