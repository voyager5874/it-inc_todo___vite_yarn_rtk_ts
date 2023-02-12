import { DefaultLayout, RootLayout } from 'layouts';
import { NotFound } from 'pages';
import { ListsPage } from 'pages/lists/ListsPage';
import { LoginPage } from 'pages/login/LoginPage';
import { UserPage } from 'pages/user/UserPage';

export const routerConfig = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {
        // "Cannot specify children on an index route" - console message.
        // Why to explicitly point out 'index: true' if this is working as is?
        // index: true,
        path: '/',
        element: <DefaultLayout />,
        children: [
          // { index: true, element: <Navigate to="lists" /> },
          { path: '/lists', element: <ListsPage /> },
          { path: '/user', element: <UserPage /> },
        ],
      },
      {
        path: '/login',
        element: <LoginPage />,
        // errorElement: <NotFound />,
      },
    ],
  },
];

// the original one was somewhat bulky and caused tests yell about "Functions are not valid as a React child"
// Possibly due to the <Navigate/> component in the router config
// Didn't seem to be an issue for the app itself
