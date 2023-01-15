import type { ReactElement } from 'react';
import { useContext } from 'react';

import { AccountCircle, DarkMode, Logout, Person, Settings } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  LinearProgress,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import { ConfirmProvider } from 'material-ui-confirm';
import { bindMenu, bindToggle } from 'material-ui-popup-state';
import { usePopupState } from 'material-ui-popup-state/hooks';
import { NavLink, Outlet } from 'react-router-dom';

import { ColorModeContext } from 'app/App';
import { serviceLogout } from 'features/user/userSlice';
import { useAppDispatch, useAppSelector } from 'hooks/redux';

export const DefaultLayout = (): ReactElement => {
  const avatar = useAppSelector(state => state.user.photoLarge);
  const appBusy = useAppSelector(state => state.app.status);

  const colorMode = useContext(ColorModeContext);

  const accountMenuControl = usePopupState({
    variant: 'popover',
    popupId: 'appBarAccountMenu',
  });

  const dispatch = useAppDispatch();

  const handleLogout = (): void => {
    dispatch(serviceLogout());
  };

  const handleToggleTheme = (): void => {
    colorMode.toggleColorMode();
    accountMenuControl.close();
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
          <Box>
            <IconButton
              {...bindToggle(accountMenuControl)}
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
            >
              <Avatar src={avatar || undefined} alt="avatar">
                <AccountCircle />
              </Avatar>
            </IconButton>
            <Menu
              {...bindMenu(accountMenuControl)}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem
                component={NavLink}
                to="/user"
                onMouseUp={accountMenuControl.close}
              >
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <Divider />
              <MenuItem>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <MenuItem onClick={handleToggleTheme}>
                <ListItemIcon>
                  <DarkMode fontSize="small" />
                </ListItemIcon>
                Toggle dark mode
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
        {appBusy === 'busy' && <LinearProgress />}
      </AppBar>
      <ConfirmProvider>
        <Outlet />
      </ConfirmProvider>
    </Box>
  );
};
