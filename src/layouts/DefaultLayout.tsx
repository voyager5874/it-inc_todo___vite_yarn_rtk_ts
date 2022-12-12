import type { MouseEvent, ReactElement } from 'react';
import { useState } from 'react';

import { AccountCircle } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import { Navigate, NavLink, Outlet } from 'react-router-dom';

import { useAppSelector } from 'app/hooks';

const pages = ['user', 'goals'];

export const DefaultLayout = (): ReactElement => {
  const auth = useAppSelector(state => state.user.auth);
  const avatar = useAppSelector(state => state.user.photoLarge);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
  //   setAuth(event.target.checked);
  // };

  const handleMenu = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  if (!auth) {
    return <Navigate to="/login" />;
  }

  return (
    <Box sx={{ backgroundColor: 'red', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Task tracker
          </Typography>
          <Box sx={{ flexGrow: 1, display: 'flex', gap: '10px' }}>
            {pages.map(page => (
              <Link
                component={NavLink}
                to={`/${page}`}
                key={page}
                sx={{
                  my: 2,
                  color: 'white',
                  display: 'block',
                }}
              >
                {page}
              </Link>
            ))}
          </Box>
          {auth && (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar src={avatar} alt="avatar">
                  <AccountCircle />
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
      <Outlet />
    </Box>
  );
};
