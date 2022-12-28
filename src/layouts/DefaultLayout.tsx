import type { MouseEvent, ReactElement } from 'react';
import { useContext, useState } from 'react';

import { AccountCircle } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  LinearProgress,
  Link,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import { NavLink, Outlet } from 'react-router-dom';

import { ColorModeContext } from 'app/App';
import { useAppDispatch, useAppSelector } from 'app/hooks';
import { serviceLogout } from 'features/user/userSlice';

const pages = ['user', 'lists'];

export const DefaultLayout = (): ReactElement => {
  const avatar = useAppSelector(state => state.user.photoLarge);
  const appBusy = useAppSelector(state => state.app.status);
  const colorMode = useContext(ColorModeContext);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const dispatch = useAppDispatch();

  // const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
  //   setAuth(event.target.checked);
  // };

  const handleMenu = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleLogout = (): void => {
    dispatch(serviceLogout());
  };

  const handleToggleTheme = (): void => {
    colorMode.toggleColorMode();
    handleClose();
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static" sx={{ height: '70px' }}>
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
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem component={NavLink} to="/user">
                Profile
              </MenuItem>
              <MenuItem onClick={handleClose}>My account</MenuItem>
              <MenuItem onClick={handleToggleTheme}>toggle theme</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </div>
        </Toolbar>
        {appBusy === 'busy' && <LinearProgress />}
      </AppBar>
      <Outlet />
    </Box>
  );
};
