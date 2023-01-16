import type { FC, ReactElement } from 'react';

import { KeyboardArrowDown } from '@mui/icons-material';
import { Box, Button, Checkbox, Menu, Stack } from '@mui/material';
import type { EntityId } from '@reduxjs/toolkit';
import { format } from 'date-fns';
import { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { usePopupState } from 'material-ui-popup-state/hooks';

import { selectTaskById, updateTask } from 'features/tasks';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { TaskDatesMenuContent } from 'pages/lists/task-dates-menu/TaskDatesMenuContent';
import { TaskCompletionBadge } from 'pages/lists/TaskCompletionBadge';
import { TaskStatus } from 'services/api/enums';
import { createDummyTaskObject } from 'utils';

type ScheduleButtonPropsType = {
  taskId: EntityId;
};

export const TaskScheduleButton: FC<ScheduleButtonPropsType> = ({
  taskId,
}): ReactElement => {
  const { startDate, deadline, status, todoListId } =
    useAppSelector(state => selectTaskById(state, taskId)) ||
    createDummyTaskObject({
      title: 'ScheduleButton -> selector -> task not found',
      startDate: null,
      deadline: null,
    });

  const datesPopupControl = usePopupState({
    variant: 'popover',
    popupId: 'task-dates-menu',
  });

  const dispatch = useAppDispatch();

  const handleTaskStatusUpdate = (): void => {
    const newStatus =
      status === TaskStatus.Completed ? TaskStatus.InProgress : TaskStatus.Completed;

    dispatch(updateTask({ taskId, listId: todoListId, data: { status: newStatus } }));
  };

  const renderScheduleButtonContent = (): ReactElement | null => {
    if (!deadline) return null;
    if (startDate && deadline) {
      return (
        <>
          <Box>{format(new Date(startDate), 'dd MMM. yyyy')}</Box>
          <Box sx={{ marginLeft: '5px', marginRight: '5px' }}>-</Box>
          <Box>{format(new Date(deadline), 'dd MMM. HH:mm yyyy')}</Box>
        </>
      );
    }
    if (!startDate && deadline) {
      const date = format(new Date(deadline), 'dd MMM. HH:mm yyyy');

      return <Box>Task due: {date}</Box>;
    }

    return null;
  };

  return (
    <>
      <Menu
        {...bindMenu(datesPopupControl)}
        sx={{
          minWidth: '300px',
          minHeight: '400px',
        }}
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
          todoListId={todoListId}
          startDate={startDate}
          deadline={deadline}
          open={datesPopupControl.isOpen}
          toggle={datesPopupControl.toggle}
        />
      </Menu>
      {deadline ? (
        <Stack alignItems="flex-start" gap={2}>
          <Stack direction="row">
            <Checkbox
              checked={status === TaskStatus.Completed}
              onChange={handleTaskStatusUpdate}
            />
            <Button
              variant="outlined"
              sx={{ justifyContent: 'flex-start' }}
              {...bindTrigger(datesPopupControl)}
              endIcon={<KeyboardArrowDown />}
            >
              {renderScheduleButtonContent()}
              {/* <Badge sx={{ backgroundColor: 'green', marginLeft: '20px' }}> */}
              {/*  {status === TaskStatus.Completed && 'Выполнено'} */}
              {/* </Badge> */}
              <TaskCompletionBadge status={status} deadline={deadline} />
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Button variant="outlined" {...bindTrigger(datesPopupControl)}>
          Define time table
        </Button>
      )}
    </>
  );
};
