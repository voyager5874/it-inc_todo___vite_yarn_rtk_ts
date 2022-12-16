import type { ChangeEvent, FC, ReactElement } from 'react';
import { useEffect, useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { selectTaskBylId, updateTask } from 'features/tasks/tasksSlice';
import type { TasksEndpointPostPutModelDataType } from 'services/api/types';

type ListDialogPropsType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  listId: string;
  taskId: string;
};

export const TaskDialog: FC<ListDialogPropsType> = ({
  open,
  setOpen,
  listId,
  taskId,
}): ReactElement => {
  const task = useAppSelector(state => selectTaskBylId(state, taskId));
  // wtf? task is not undefined but taskTitle is ???
  // const [taskTitle, setTaskTitle] = useState<string>(task?.title || '');
  const [taskTitle, setTaskTitle] = useState<string>('');

  // this is rather a kludge
  useEffect(() => {
    if (!task?.title) return;
    setTaskTitle(task.title);
  }, [task?.title, taskId]);

  const dispatch = useAppDispatch();

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleEditTitle = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ): void => {
    setTaskTitle(event.target.value);
  };

  const handleSaveChanges = (): void => {
    if (!taskTitle) return;
    const taskData: TasksEndpointPostPutModelDataType = { title: taskTitle };

    dispatch(updateTask({ listId, taskId, data: taskData }));
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Subscribe</DialogTitle>
      <DialogContent sx={{ minWidth: '25vw' }}>
        <DialogContentText>edit task data</DialogContentText>
        <TextField
          margin="dense"
          id="task-title"
          label="task title"
          fullWidth
          variant="standard"
          value={taskTitle}
          onChange={handleEditTitle}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSaveChanges}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};
