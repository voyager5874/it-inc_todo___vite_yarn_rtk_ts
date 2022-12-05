import { ReactElement } from 'react';

import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { RootLayout } from 'layouts';
import { NotFound } from 'pages';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
  },
]);

export const App = (): ReactElement => {
  return <RouterProvider router={router} />;
};
