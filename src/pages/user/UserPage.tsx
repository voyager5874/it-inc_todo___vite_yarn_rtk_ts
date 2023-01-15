import type { ReactElement } from 'react';

import { Container } from '@mui/material';

import { UserCard } from 'features/user/UserCard';

export const UserPage = (): ReactElement => {
  // const avatar = useAppSelector(state => state.user.photoLarge);
  // const name = useAppSelector(state => state.user.name);
  // const dispatch = useAppDispatch();
  //
  // const handleLogout = (): void => {
  //   dispatch(serviceLogout());
  // };

  return (
    <Container
      sx={{
        height: '90vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* <Avatar src={avatar}> */}
      {/*  <AccountBoxIcon /> */}
      {/* </Avatar> */}
      {/* <h2>{name}</h2> */}
      {/* <Button onClick={handleLogout}>Logout</Button> */}
      <UserCard />
    </Container>
  );
};
