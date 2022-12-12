import type { FC, ReactElement } from 'react';
import { useEffect } from 'react';

import { Paper } from '@mui/material';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import type { GoalEntityAppType } from 'features/goals/types';
import { fetchTasks, selectTasksByGoalId } from 'features/tasks/tasksSlice';

export const GoalCard: FC<GoalEntityAppType> = ({ title, id }): ReactElement => {
  const tasks = useAppSelector(state => selectTasksByGoalId(state, id));
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchTasks(id));
  }, [id]);

  return (
    <Paper sx={{ width: '300px' }}>
      <h3>{title}</h3>
      <ul>
        {(tasks || []).map(task => (
          <h5 key={task.id}>{task.title}</h5>
        ))}
      </ul>
    </Paper>
  );
};
