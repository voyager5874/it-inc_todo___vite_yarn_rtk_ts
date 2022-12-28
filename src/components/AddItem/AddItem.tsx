import type { ChangeEvent, FC, KeyboardEvent } from 'react';
import { useState } from 'react';

import { Close, MoreHoriz } from '@mui/icons-material';
import {
  Box,
  Button,
  ClickAwayListener,
  IconButton,
  Paper,
  TextField,
} from '@mui/material';

import { SERVER_ENTITY_MAX_TITLE_LENGTH } from 'services/api/constants';

export type AddItemPropsType = {
  submit: (title: string) => void;
  extraControls?: boolean;
  backplate?: boolean;
  buttonName: string;
  hide: () => void;
  // refProp: Ref<HTMLDivElement>;
};
export const AddItem: FC<AddItemPropsType> = ({
  submit,
  extraControls = false,
  backplate = false,
  buttonName,
  hide,
  // refProp,
}) => {
  const [itemTitle, setItemTitle] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (): void => {
    const title = itemTitle.trim();

    if (!title) return;
    submit(title);
    setItemTitle(''); // reset the field only if the request was successful
    hide();
  };

  const saveText = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    if (error && event.target.value.length <= SERVER_ENTITY_MAX_TITLE_LENGTH)
      setError('');
    if (event.target.value.length <= SERVER_ENTITY_MAX_TITLE_LENGTH) {
      setItemTitle(event.target.value);
    }
    if (event.target.value.length > SERVER_ENTITY_MAX_TITLE_LENGTH && !error) {
      setError('100 symbols maximum');
    }
  };

  const handleKeyboard = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
    if (event.key === 'Escape') {
      hide();
    }
  };

  return (
    <ClickAwayListener onClickAway={hide}>
      <Paper
        // ref={refProp}
        sx={[
          {
            maxWidth: '400px',
            minWidth: '280px',
            // marginRight: '20px',
            padding: backplate ? '20px' : '0px',
            boxShadow: 'none',
          },
          theme => ({
            backgroundColor:
              theme.palette.mode === 'dark'
                ? theme.palette.grey[900]
                : theme.palette.grey[300],
          }),
        ]}
      >
        <TextField
          helperText={error}
          error={Boolean(error)}
          multiline
          maxRows={7}
          variant="outlined"
          value={itemTitle}
          onChange={saveText}
          fullWidth
          autoFocus
          onKeyDown={handleKeyboard}
          sx={[
            {
              boxShadow: 2,
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
              // boxShadow: theme.shadows[2],
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
              onClick={hide}
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
    </ClickAwayListener>
  );
};
