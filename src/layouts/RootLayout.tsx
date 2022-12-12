import type { ReactElement } from 'react';

import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

export const RootLayout = (): ReactElement => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'green' }}>
      <Outlet />
    </Box>
  );
};
