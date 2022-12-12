import type { ReactElement } from 'react';

import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { Avatar, Button, Container } from '@mui/material';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { serviceLogout } from 'features/user/userSlice';

export const UserPage = (): ReactElement => {
  const avatar = useAppSelector(state => state.user.photoLarge);
  const name = useAppSelector(state => state.user.name);
  const dispatch = useAppDispatch();

  const handleLogout = (): void => {
    dispatch(serviceLogout());
  };

  return (
    <Container>
      <Avatar src={avatar}>
        <AccountBoxIcon />
      </Avatar>
      <h2>{name}</h2>
      <Button onClick={handleLogout}>Logout</Button>
    </Container>
  );
};
