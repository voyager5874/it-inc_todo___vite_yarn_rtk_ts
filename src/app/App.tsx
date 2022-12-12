import type { ReactElement } from 'react';
import { useEffect } from 'react';

import './App.css';
import { Box, CircularProgress, CssBaseline } from '@mui/material';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { selectAppInitializationStatus } from 'app/appSlice';
import { useAppDispatch, useAppSelector } from 'app/hooks';
import { authenticateUser } from 'features/user/userSlice';
import { RootLayout } from 'layouts';
import { DefaultLayout } from 'layouts/DefaultLayout';
import { NotFound } from 'pages';
import { GoalsPage } from 'pages/goalsList/GoalsPage';
import { LoginPage } from 'pages/login/LoginPage';
import { UserPage } from 'pages/user/UserPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
        errorElement: <NotFound />,
      },
      {
        path: '/goals',
        element: <DefaultLayout />,
        errorElement: <NotFound />,
        children: [
          {
            index: true,
            element: <GoalsPage />,
          },
        ],
      },
      {
        path: '/user',
        element: <DefaultLayout />,
        errorElement: <NotFound />,
        children: [
          {
            index: true,
            element: <UserPage />,
          },
        ],
      },
    ],
  },
]);

export const App = (): ReactElement => {
  const appIsInitialized = useAppSelector(state => selectAppInitializationStatus(state));
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!appIsInitialized) {
      dispatch(authenticateUser());
    }
  });
  if (!appIsInitialized) {
    return (
      <Box sx={{ position: 'fixed', top: '30%', textAlign: 'center', width: '100%' }}>
        <CircularProgress size="10vw" />
      </Box>
    );
  }

  return (
    <>
      <CssBaseline />
      <RouterProvider router={router} />;
    </>
  );
};
