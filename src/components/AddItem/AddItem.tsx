import type { ChangeEvent, FC } from 'react';
import { useState } from 'react';

import { Add, Close, MoreHoriz, Style } from '@mui/icons-material';
import { Box, Button, IconButton, Paper, TextField } from '@mui/material';

export type AddItemPropsType = {
  buttonName: string;
  callback: (title: string) => void;
  extraControls?: boolean;
  backplate?: boolean;
};
export const AddItem: FC<AddItemPropsType> = ({
  buttonName,
  callback,
  extraControls = false,
  backplate = false,
}) => {
  const [active, setActive] = useState(false);
  const [itemTitle, setItemTitle] = useState('');

  const activateForm = (): void => {
    setActive(true);
  };

  const deactivateForm = (): void => {
    setActive(false);
    setItemTitle('');
  };

  const handleSubmit = (): void => {
    const title = itemTitle.trim();

    if (!title) return;
    callback(title);
    deactivateForm();
    setItemTitle('');
  };

  const saveText = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    setItemTitle(event.target.value);
  };

  return !active ? (
    <Box sx={{ marginRight: '20px', minWidth: '250px', display: 'flex', gap: '7px' }}>
      <Button
        onClick={activateForm}
        sx={{ padding: '7px 20px 7px 20px', justifyContent: 'flex-start', flexGrow: 1 }}
        variant="text"
        startIcon={<Add />}
      >
        {buttonName}
      </Button>
      {extraControls && (
        <IconButton sx={{ borderRadius: '0.2em' }}>
          <Style />
        </IconButton>
      )}
    </Box>
  ) : (
    <Paper
      sx={[
        {
          maxWidth: '400px',
          minWidth: '280px',
          marginRight: '20px',
          padding: backplate ? '10px' : '0px',
          boxShadow: 'none',
        },
        theme => ({
          backgroundColor: () => {
            if (theme.palette.mode === 'dark') {
              return theme.palette.grey[900];
            }

            return theme.palette.grey[300];
          },
        }),
      ]}
    >
      <TextField
        multiline
        maxRows={7}
        variant="outlined"
        value={itemTitle}
        onChange={saveText}
        fullWidth
        sx={[
          {
            marginBottom: '10px',
            // width: '100%',
            // minHeight: '50px',
            // resize: 'vertical',
            // maxHeight: '200px',
            // outline: 'none',
            // border: 'none',
            borderRadius: '4px',
            '& fieldset': { border: 'none' },
          },
          theme => ({
            boxShadow: theme.shadows[2],
            backgroundColor:
              theme.palette.mode === 'light'
                ? theme.palette.background.paper
                : theme.palette.grey[900],
          }),
        ]}
      />
      <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
          <Button onClick={handleSubmit} variant="contained">
            {buttonName}
          </Button>
          <IconButton
            onClick={deactivateForm}
            sx={{
              borderRadius: '4px',
            }}
          >
            <Close />
          </IconButton>
        </Box>
        {extraControls && (
          <IconButton
            sx={{
              borderRadius: '4px',
            }}
          >
            <MoreHoriz />
          </IconButton>
        )}
      </Box>
    </Paper>
  );
};
