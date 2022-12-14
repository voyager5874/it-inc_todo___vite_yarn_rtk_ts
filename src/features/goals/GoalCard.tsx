import type { FC, ReactElement } from 'react';
import { useEffect } from 'react';

import { List, ListItem, Paper, Typography } from '@mui/material';
import SimpleBar from 'simplebar-react';

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
    <Paper
      sx={{ minWidth: '300px', padding: '20px', maxHeight: '90vh', maxWidth: '400px' }}
    >
      <Typography variant="h5" sx={{ backgroundColor: 'background.default' }}>
        {title}
      </Typography>
      <List sx={{ overflowY: 'auto', backgroundColor: 'red' }}>
        <SimpleBar autoHide={false} style={{ maxHeight: '80vh' }}>
          {(tasks || []).map(task => (
            <ListItem key={task.id}>{task.title}</ListItem>
          ))}
        </SimpleBar>
      </List>
    </Paper>
  );
};
