import type { ChangeEvent, FC } from 'react';
import { useState } from 'react';

import { Add, Style } from '@mui/icons-material';
import { Box, Button, IconButton, TextareaAutosize } from '@mui/material';

export type AddItemPropsType = {
  buttonName: string;
  callback: (title: string) => void;
};
export const AddItem: FC<AddItemPropsType> = ({ buttonName, callback }) => {
  const [active, setActive] = useState(false);
  const [itemTitle, setItemTitle] = useState('');

  const activateForm = (): void => {
    setActive(true);
  };

  const deactivateForm = (): void => {
    setActive(false);
  };

  const handleSubmit = (): void => {
    const title = itemTitle.trim();

    if (!title) return;
    callback(title);
    deactivateForm();
    setItemTitle('');
  };

  const saveText = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    console.log(event.target.value);
    // console.log(event.currentTarget.value);
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
      <IconButton sx={{ borderRadius: '0.2em' }}>
        <Style />
      </IconButton>
    </Box>
  ) : (
    <Box sx={{ maxWidth: '400px', minWidth: '250px', marginRight: '20px' }}>
      <TextareaAutosize
        value={itemTitle}
        onChange={saveText}
        style={{
          width: '100%',
          minHeight: '50px',
          resize: 'vertical',
          maxHeight: '200px',
          outline: 'none',
        }}
      />
      <Box>
        <Button onClick={handleSubmit}>{buttonName}</Button>
        <Button onClick={deactivateForm}>X</Button>
      </Box>
    </Box>
  );
};
