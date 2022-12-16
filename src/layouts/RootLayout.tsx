import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

import type { AlertColor } from '@mui/material';
import { Alert, Box, Snackbar } from '@mui/material';
import { Outlet } from 'react-router-dom';

import { resetAppEvents } from 'app/appSlice';
import { useAppDispatch, useAppSelector } from 'app/hooks';

export const RootLayout = (): ReactElement => {
  const error = useAppSelector(state => state.app.error);
  const success = useAppSelector(state => state.app.success);
  const info = useAppSelector(state => state.app.info);

  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor | undefined>(
    undefined,
  );

  const dispatch = useAppDispatch();

  const showSnackbar = error || success || info;

  useEffect(() => {
    if (error) setSnackbarSeverity('error');
    if (success) setSnackbarSeverity('success');
    if (info) setSnackbarSeverity('info');
  }, [error, success, info]);

  const handleSnackbarClose = (): void => {
    dispatch(resetAppEvents());
  };

  return (
    <Box sx={{ minHeight: '100vh', border: '3px solid green' }} p={0}>
      <Snackbar open={showSnackbar} autoHideDuration={5000} onClose={handleSnackbarClose}>
        <Alert variant="filled" severity={snackbarSeverity}>
          {error || success || info}
        </Alert>
      </Snackbar>
      <Outlet />
    </Box>
  );
};
