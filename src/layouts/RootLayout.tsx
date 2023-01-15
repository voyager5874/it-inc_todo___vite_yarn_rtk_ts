import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

import type { AlertColor } from '@mui/material';
import { Alert, Box, Snackbar } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';

import { resetAppEvents } from 'app/appSlice';
import { useAppDispatch, useAppSelector } from 'hooks/redux';

export const RootLayout = (): ReactElement => {
  const error = useAppSelector(state => state.app.error);
  const success = useAppSelector(state => state.app.success);
  const info = useAppSelector(state => state.app.info);

  const auth = useAppSelector(state => state.user.auth);

  const [alertSeverity, setAlertSeverity] = useState<AlertColor | undefined>(undefined);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const showSnackbar = Boolean(error || success || info);

  useEffect(() => {
    if (error) setAlertSeverity('error');
    if (success) setAlertSeverity('success');
    if (info) setAlertSeverity('info');
  }, [error, success, info]);

  // probably the app router needs optimization
  useEffect(() => {
    // if (auth) navigate('/lists');
    if (!auth) navigate('/login');
  }, [auth, navigate]);

  const handleSnackbarClose = (): void => {
    dispatch(resetAppEvents());
  };

  return (
    <Box sx={{ minHeight: '100vh' }} p={0}>
      <Snackbar open={showSnackbar} autoHideDuration={5000} onClose={handleSnackbarClose}>
        <Alert variant="filled" severity={alertSeverity}>
          {error || success || info}
        </Alert>
      </Snackbar>
      <Outlet />
    </Box>
  );
};
