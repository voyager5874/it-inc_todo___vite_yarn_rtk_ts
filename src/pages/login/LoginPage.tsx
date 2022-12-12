import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from 'app/hooks';
import { LoginForm } from 'pages/login/LoginForm';

export const LoginPage = (): ReactElement => {
  const auth = useAppSelector(state => state.user.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth) return;
    navigate('../goals', { replace: true });
  }, [auth, navigate]);

  return (
    <Container
      sx={{
        backgroundColor: 'grey',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <LoginForm />
    </Container>
  );
};
