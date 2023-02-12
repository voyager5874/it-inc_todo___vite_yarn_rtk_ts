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
import { createHashRouter, RouterProvider } from 'react-router-dom';

import { selectAppInitializationStatus } from 'app/appSlice';
import { routerConfig } from 'app/routerConfig';
import { authenticateUser } from 'features/user/userSlice';
import { useAppDispatch, useAppSelector } from 'hooks/redux';

const router = createHashRouter(routerConfig);

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
