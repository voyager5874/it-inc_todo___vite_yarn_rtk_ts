import type { ChangeEvent, FC } from 'react';
import { useState } from 'react';

import { Box, Button, TextareaAutosize } from '@mui/material';

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
    <Button onClick={activateForm} sx={{ minWidth: '300px' }} variant="contained">
      {buttonName}
    </Button>
  ) : (
    <Box sx={{ maxWidth: '400px', minWidth: '300px' }}>
      <TextareaAutosize
        value={itemTitle}
        onChange={saveText}
        style={{
          width: '100%',
          minHeight: '50px',
          resize: 'vertical',
          maxHeight: '200px',
        }}
      />
      <Box>
        <Button onClick={handleSubmit}>{buttonName}</Button>
        <Button onClick={deactivateForm}>X</Button>
      </Box>
    </Box>
  );
};
