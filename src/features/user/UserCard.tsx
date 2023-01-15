import type { ReactElement } from 'react';

import AccountBoxIcon from '@mui/icons-material/AccountBox';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material';

import { EditableText } from 'components/EditableText/EditableText';
import { serviceLogout } from 'features/user/userSlice';
import { useAppDispatch, useAppSelector } from 'hooks/redux';

export const UserCard = (): ReactElement => {
  const avatar = useAppSelector(state => state.user.photoLarge);
  const name = useAppSelector(state => state.user.name);

  const dispatch = useAppDispatch();

  const handleLogout = (): void => {
    dispatch(serviceLogout());
  };
  const handleChangeName = (newName: string): Promise<any> => {
    // return dispatch(updateUserData({})).unwrap();
    return new Promise(res => {
      setTimeout(() => res(newName), 1000);
    });
  };

  return (
    <Card
      sx={{
        maxWidth: '400px',
        minHeight: '400px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ position: 'relative', height: '200px' }}>
        <CardMedia
          component="img"
          alt="user banner"
          height="150"
          image="https://www.codingem.com/wp-content/uploads/2021/10/juanjo-jaramillo-mZnx9429i94-unsplash-2048x1365.jpg?ezimgfmt=ng%3Awebp%2Fngcb1%2Frs%3Adevice%2Frscb1-2"
        />
        <Avatar
          src={avatar}
          sx={{
            position: 'absolute',
            bottom: '0px',
            left: '50%',
            transform: 'translateX(-50%)',
            // left: 'calc(50% - 50px)',
            width: '100px',
            height: '100px',
          }}
        >
          <AccountBoxIcon />
        </Avatar>
      </Box>

      <CardContent>
        <EditableText
          text={name}
          submitCallback={handleChangeName}
          variant="h5"
          sx={{ marginBottom: '20px' }}
        />
        {/* <Typography gutterBottom variant="h5" component="div"> */}
        {/*  {name} */}
        {/* </Typography> */}
        <Typography variant="body2" color="text.secondary">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
          nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
          fugiat nulla pariatur
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={handleLogout}>
          Logout
        </Button>
        {/* <Button size="small">Learn More</Button> */}
      </CardActions>
    </Card>
  );
};
