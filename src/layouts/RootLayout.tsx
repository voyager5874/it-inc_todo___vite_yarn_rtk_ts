import { ReactElement } from 'react';

import { Outlet } from 'react-router-dom';

export const RootLayout = (): ReactElement => {
  return (
    <div>
      <Outlet />
    </div>
  );
};
