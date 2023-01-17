import type { FC } from 'react';

import { Circle } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import { FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import type { EntityId } from '@reduxjs/toolkit';

import { selectTaskById, updateTask } from 'features/tasks';
import type { UpdateTaskThunkArgType } from 'features/tasks/types';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { TaskPriority } from 'services/api/enums';
import { createDummyTaskObject } from 'utils';

type TaskPriorityControlPropsType = {
  taskId: EntityId;
};

export const TaskPriorityControl: FC<TaskPriorityControlPropsType> = ({ taskId }) => {
  const { priority, todoListId } =
    useAppSelector(state => selectTaskById(state, taskId)) ||
    createDummyTaskObject({ title: 'error: TaskPriorityControl -> selectTaskById' });

  const dispatch = useAppDispatch();

  const colors = ['green', 'yellow', 'orange', 'red', 'blue'];

  const handleTaskPriorityChange = (e: SelectChangeEvent): void => {
    const priorityValue: TaskPriority = Number(e.target.value);

    const thunkArg: UpdateTaskThunkArgType = {
      listId: todoListId,
      taskId,
      data: { priority: priorityValue },
    };

    // I'm not using async action result right now
    dispatch(updateTask(thunkArg));
  };

  return (
    <Stack direction="row" alignItems="center" gap="0.6em">
      <Circle fontSize="medium" sx={{ color: colors[priority] }} />
      <FormControl sx={{ mt: 1, minWidth: '150px' }} size="small">
        <InputLabel id="select-task-priority-label" sx={{ display: 'none' }}>
          choose task priority
        </InputLabel>
        <Select
          inputProps={{
            MenuProps: {
              // sx: {
              //   '&& .Mui-selected': {
              //     backgroundColor: 'pink',
              //   },
              // },
              // MenuListProps: {
              //   sx: {
              //     backgroundColor: 'transparent',
              //   },
              // },
            },
          }}
          labelId="select-task-priority-label"
          id="task-edit-dialog-select-task-priority"
          value={`${priority}`}
          onChange={handleTaskPriorityChange}
          autoWidth
        >
          <MenuItem value={TaskPriority.Later}>Brainstorm</MenuItem>
          <MenuItem value={TaskPriority.Low}>Low</MenuItem>
          <MenuItem value={TaskPriority.Middle}>Middle</MenuItem>
          <MenuItem value={TaskPriority.High}>High</MenuItem>
          <MenuItem value={TaskPriority.Urgent}>Urgent</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
};
