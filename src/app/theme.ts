import { createTheme } from '@mui/material';
import type { ThemeOptions } from '@mui/material/styles';
import createPalette from '@mui/material/styles/createPalette';

const darkScheme = createPalette({
  mode: 'dark',
  primary: {
    main: '#48403e',
  },
  secondary: {
    main: '#4a687c',
  },
  background: {
    default: '#131915',
  },
  text: {
    primary: '#bfb49f',
  },
  success: {
    main: '#428643',
  },
});

// const lightScheme = createPalette({
//   mode: 'light',
//   primary: {
//     main: '#6a7b72',
//   },
//   secondary: {
//     main: '#4a687c',
//   },
//   background: {
//     default: '#bfb49f',
//   },
//   text: {
//     primary: '#131915',
//   },
//   success: {
//     main: '#428643',
//   },
// });

// export const theme = extendTheme({
//   colorSchemes: {
//     light: {
//       palette: lightScheme,
//     },
//     dark: {
//       palette: darkScheme,
//     },
//   },
// });

const themeOptions: ThemeOptions = {
  palette: darkScheme,
};

export const theme = createTheme(themeOptions);
