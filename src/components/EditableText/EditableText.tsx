import type { ChangeEvent, FC } from 'react';
import { useState } from 'react';

import { OutlinedInput, Typography } from '@mui/material';

type EditableTextPropsType = {
  text: string;
  submitCallback: (text: string) => void;
};

export const EditableText: FC<EditableTextPropsType> = ({ text, submitCallback }) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>(text);

  const activateEditMode = (): void => {
    setEditMode(true);
  };

  const handleInputBlur = (): void => {
    setEditMode(false);
    const newTitle = userInput.trim();

    if (newTitle !== text) {
      submitCallback(newTitle);
    } else {
      setUserInput(newTitle);
    }
  };

  const saveNewText = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ): void => {
    setUserInput(event.target.value);
  };

  return !editMode ? (
    <Typography
      onClick={activateEditMode}
      variant="h5"
      sx={{ wordBreak: 'break-word', cursor: 'pointer' }}
    >
      {text}
    </Typography>
  ) : (
    <OutlinedInput
      autoFocus
      sx={{ margin: '0px' }}
      value={userInput}
      onChange={saveNewText}
      onBlur={handleInputBlur}
    />
  );
};
