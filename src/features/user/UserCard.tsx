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
import { changeUserName, serviceLogout } from 'features/user/userSlice';
import { useAppDispatch, useAppSelector } from 'hooks/redux';

export const UserCard = (): ReactElement => {
  const avatar = useAppSelector(state => state.user.photoLarge);
  const name = useAppSelector(state => state.user.name);
  const email = useAppSelector(state => state.user.email);
  const about = useAppSelector(state => state.user.about);

  const dispatch = useAppDispatch();

  const handleLogout = (): void => {
    dispatch(serviceLogout());
  };
  const handleChangeName = (newName: string): Promise<any> => {
    return dispatch(changeUserName(newName)).unwrap();
    // return new Promise(res => {
    //   setTimeout(() => res(newName), 1000);
    // });
  };

  return (
    <Card
      elevation={10}
      sx={{
        borderRadius: '5px',
        minWidth: '350px',
        maxWidth: '450px',
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
          src={avatar || undefined}
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

      <CardContent sx={{ padding: '20px 20px 0 20px' }}>
        <EditableText
          text={name}
          submitCallback={handleChangeName}
          variant="h5"
          // style={{ marginBottom: '20px' }}
        />
        <Typography variant="caption" color="text.secondary">
          {email}
        </Typography>
        {about && (
          <Typography variant="body1" color="text.secondary" sx={{ marginTop: '20px' }}>
            {about}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ padding: '20px' }}>
        <Button size="small" onClick={handleLogout}>
          Logout
        </Button>
        {/* <Button size="small">Learn More</Button> */}
      </CardActions>
    </Card>
  );
};
