import type { ChangeEvent, FC, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { TypographyProps } from '@mui/material';
import { Button, TextField, Typography } from '@mui/material';

type EditableTextPropsType = TypographyProps & {
  text: string;
  defaultText?: string;
  maxInputRows?: number;
  submitCallback: (newText: string) => Promise<any>;
  // variant?: TypographyVariant;
  // reference: Ref<any>;
};

export const EditableText: FC<EditableTextPropsType> = ({
  text,
  defaultText,
  variant = 'h6',
  maxInputRows = 5,
  submitCallback,
  ...restProps
}) => {
  const [editMode, setEditMode] = useState<boolean>(false);

  // The only validation needed here is length, I'll show server error message and
  // will avoid setting state on every keystroke
  const textInput = useRef<null | HTMLInputElement>(null);
  // const textDataRef = useRef<string>(text);
  const allowSubmit = useRef<boolean>(true);

  const activateEditMode = (): void => {
    allowSubmit.current = true;
    setEditMode(true);
  };

  // const handleSubmit = (): void => {
  //   setEditMode(false); // 'optimistic UI' -> need to temporally set newText but revert it if request rejected
  //   const newTitle = userInput.trim();
  //
  //   if (newTitle !== text) {
  //     submitCallback(newTitle).catch(() => setEditMode(true));
  //   } else {
  //     setUserInput(newTitle);
  //   }
  // };

  // this component currently violates flux flow principle ?
  // changed name was displayed even though I tried to set empty object resulting from put request
  const handleSubmit = (): void => {
    if (!allowSubmit.current) return;
    setEditMode(false); // 'optimistic UI' -> need to temporally set newText but revert it if request rejected
    if (!textInput?.current?.value) return;
    const newTitle = textInput.current.value.trim();

    if (newTitle !== text) {
      submitCallback(newTitle).catch(() => {
        setEditMode(true);
        // textInput.current?.focus();
      });
    } else {
      textInput.current.value = newTitle; // get rid of trailing spaces
      // textDataRef.current = newTitle; // if input not exist
      // textInput.current?.focus();
    }
  };

  // this useEffect causing errors in mui OutlinedInput (too many renders).
  // Though the error itself seems to be related
  // to multiline prop and autosize
  // row={some value} instead of maxRow or multiline={false} fix it

  // useEffect(() => {
  //   if (!textInput.current) return;
  //   if (textInput.current.value === text) return;
  //   textInput.current.value = text;
  // }, [editMode]);

  useEffect(() => {
    if (!textInput.current) return;
    if (editMode) textInput.current?.focus();
  }, [editMode]);

  const saveNewText = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ): void => {
    if (textInput.current) {
      textInput.current.value = event.target.value;
    }
  };

  const handleKeyboardFormControl = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
    if (event.key === 'Escape') {
      // prevent onBlur
      allowSubmit.current = false;
      if (textInput.current) {
        // cancel changes
        textInput.current.value = text;
      }
      setEditMode(false);
    }
  };

  return (
    <>
      <Button
        fullWidth
        variant="text"
        sx={{
          color: theme => theme.palette.text.primary,
          textAlign: 'left',
          textTransform: 'none',
          zIndex: '11',
          padding: 0,
          margin: 0,
          display: !editMode ? 'block' : 'none',
        }}
      >
        <Typography
          onClick={activateEditMode}
          variant={variant}
          {...restProps}
          sx={{
            zIndex: '10',
            wordBreak: 'break-word',
            cursor: 'pointer',
            padding: 0,
            margin: 0,
            display: !editMode ? 'block' : 'none',
          }}
        >
          {textInput?.current?.value || text || defaultText}
        </Typography>
      </Button>

      <TextField
        variant="outlined"
        defaultValue={text}
        placeholder={defaultText}
        inputRef={textInput}
        fullWidth
        onKeyDown={handleKeyboardFormControl}
        multiline
        maxRows={maxInputRows}
        autoFocus
        sx={{
          fontSize: '1.5em',
          margin: '0px',
          padding: '0',
          display: editMode ? 'block' : 'none',
          zIndex: '9',
        }}
        onChange={saveNewText}
        onBlur={handleSubmit}
      />
    </>
  );
};
