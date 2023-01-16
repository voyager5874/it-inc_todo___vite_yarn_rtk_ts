import type { ReactElement } from 'react';
import { createContext, useEffect, useMemo, useState } from 'react';

import type { PaletteMode } from '@mui/material';
import {
  Box,
  CircularProgress,
  createTheme,
  CssBaseline,
  ThemeProvider,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom';

import { selectAppInitializationStatus } from 'app/appSlice';
import { authenticateUser } from 'features/user/userSlice';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { RootLayout } from 'layouts';
import { DefaultLayout } from 'layouts/DefaultLayout';
import { NotFound } from 'pages';
import { ListsPage } from 'pages/lists/ListsPage';
import { LoginPage } from 'pages/login/LoginPage';
import { UserPage } from 'pages/user/UserPage';

const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Navigate to="/lists" /> },
      {
        path: '/login',
        element: <LoginPage />,
        // errorElement: <NotFound />,
      },
      {
        path: '/lists',
        element: <DefaultLayout />,
        // errorElement: <NotFound />,
        children: [
          {
            index: true,
            element: <ListsPage />,
          },
        ],
      },
      {
        path: '/user',
        element: <DefaultLayout />,
        // errorElement: <NotFound />,
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

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const App = (): ReactElement => {
  const appIsInitialized = useAppSelector(state => selectAppInitializationStatus(state));

  const dispatch = useAppDispatch();

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [colorMode, setColorMode] = useState<PaletteMode>(
    prefersDarkMode ? 'dark' : 'light',
  );

  const toggleTheme = useMemo(
    () => ({
      toggleColorMode: () => {
        setColorMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: colorMode,
        },
      }),
    [colorMode],
  );

  useEffect(() => {
    if (!appIsInitialized) {
      dispatch(authenticateUser());
    }
  });

  if (!appIsInitialized) {
    return (
      <Box sx={{ position: 'fixed', top: '40%', textAlign: 'center', width: '100%' }}>
        <CircularProgress size="10vw" sx={{ marginBottom: '30px' }} />
        <Typography variant="h5">Initialization...</Typography>
      </Box>
    );
  }

  return (
    <ColorModeContext.Provider value={toggleTheme}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
