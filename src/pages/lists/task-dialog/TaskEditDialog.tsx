import type { FC, ReactElement } from 'react';

import {
  Beenhere,
  DateRange,
  Description,
  PriorityHigh,
  Title,
} from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  Tooltip,
  Typography,
} from '@mui/material';
import type { EntityId } from '@reduxjs/toolkit';
import { bindMenu } from 'material-ui-popup-state';
import { usePopupState } from 'material-ui-popup-state/hooks';

import { EditableText } from 'components/EditableText/EditableText';
import { selectListTitle } from 'features/lists';
import { selectTaskById, selectTaskTitle, updateTask } from 'features/tasks';
import type { UpdateTaskThunkArgType } from 'features/tasks/types';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { TaskDatesMenuContent } from 'pages/lists/task-dates-menu/TaskDatesMenuContent';
import { TaskScheduleButton } from 'pages/lists/task-dialog/TaskScheduleButton';

type ListDialogPropsType = {
  open: boolean;
  setOpen: (value: boolean) => void;
  listId: EntityId;
  taskId: EntityId;
};

export const TaskEditDialog: FC<ListDialogPropsType> = ({
  open,
  setOpen,
  listId,
  taskId,
}): ReactElement => {
  const taskTitle = useAppSelector(state => selectTaskTitle(state, taskId));
  const task = useAppSelector(state => selectTaskById(state, taskId));
  const listName = useAppSelector(state => selectListTitle(state, listId));

  const popupState = usePopupState({ variant: 'popper', popupId: 'taskDatesPopper' });

  const dispatch = useAppDispatch();

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleUpdateTaskDescription = async (text: string): Promise<any> => {
    const thunkArg: UpdateTaskThunkArgType = {
      listId,
      taskId,
      data: { description: text },
    };

    return dispatch(updateTask(thunkArg)).unwrap;
  };

  const handleUpdateTaskTitle = async (text: string): Promise<any> => {
    const thunkArg: UpdateTaskThunkArgType = {
      listId,
      taskId,
      data: { title: text },
    };

    return dispatch(updateTask(thunkArg)).unwrap;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle component="div" sx={{ maxWidth: '90%' }}>
        Edit {task?.title || 'task'}
      </DialogTitle>

      <DialogContent sx={{ minHeight: '80vh' }}>
        <List>
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <Title />
            </ListItemIcon>

            <ListItemText
              primary={
                <EditableText
                  variant="h5"
                  noWrap
                  text={taskTitle}
                  submitCallback={handleUpdateTaskTitle}
                />
              }
              secondary={
                <Typography variant="subtitle2" sx={{ wordBreak: 'break-word' }}>
                  in the
                  <Tooltip title="Move to another list" placement="top">
                    <Button
                      variant="text"
                      size="small"
                      sx={{
                        // textDecoration: 'underline',
                        // color: theme => theme.palette.text.secondary,
                        textTransform: 'none',
                        textAlign: 'left',
                        display: 'inline-block',
                        marginLeft: '0.5em',
                        marginRight: '0.5em',
                      }}
                    >
                      {listName}
                    </Button>
                  </Tooltip>
                  column
                </Typography>
              }
            />
          </ListItem>
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <PriorityHigh />
            </ListItemIcon>
            <ListItemText
              primary="Priority"
              secondary={
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Beenhere />}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {task?.priority}
                </Button>
              }
            />
          </ListItem>
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <DateRange />
            </ListItemIcon>
            <ListItemText
              primary="Schedule"
              secondary={<TaskScheduleButton taskId={taskId} />}
            />
          </ListItem>
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              <Description />
            </ListItemIcon>
            <ListItemText
              primary="Description:"
              secondary={
                <EditableText
                  style={{
                    // backgroundColor: 'grey',
                    textIndent: '1em',
                    minHeight: '80px',
                    padding: '10px',
                    borderRadius: '5px',
                  }}
                  defaultText="Add task description"
                  text={task?.description || ''}
                  submitCallback={handleUpdateTaskDescription}
                />
              }
            />
          </ListItem>
        </List>
        <Menu
          {...bindMenu(popupState)}
          sx={{ minWidth: '300px', minHeight: '400px' }}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'center',
          }}
        >
          <TaskDatesMenuContent
            id={taskId}
            todoListId={listId}
            startDate={task?.startDate ?? null}
            deadline={task?.deadline ?? null}
            open={popupState.isOpen}
            toggle={popupState.toggle}
          />
        </Menu>
      </DialogContent>
    </Dialog>
  );
};
