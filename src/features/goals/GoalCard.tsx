import type { FC, ReactElement } from 'react';
import { useEffect } from 'react';

import { List, ListItem, Paper, Typography } from '@mui/material';
import SimpleBar from 'simplebar-react';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { AddItem } from 'components/AddItem/AddItem';
import type { GoalEntityAppType } from 'features/goals/types';
import { addTask, fetchTasks, selectTasksByGoalId } from 'features/tasks/tasksSlice';
import type { TaskEndpointPostPutModelDataType } from 'services/api/types';

export const GoalCard: FC<GoalEntityAppType> = ({ title, id }): ReactElement => {
  const tasks = useAppSelector(state => selectTasksByGoalId(state, id));
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchTasks(id));
  }, [id, dispatch]);

  const handleAddTask = (taskTitle: string): void => {
    const taskData: TaskEndpointPostPutModelDataType = { title: taskTitle };

    dispatch(addTask({ goalId: id, data: taskData }));
  };

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
      <AddItem buttonName="add task" callback={handleAddTask} />
    </Paper>
  );
};
