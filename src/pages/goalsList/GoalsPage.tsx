import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { Stack } from '@mui/material';
import SimpleBar from 'simplebar-react';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { AddItem } from 'components/AddItem/AddItem';
import { addGoal, fetchGoals, GoalCard, selectAllGoals } from 'features/goals';

export const GoalsPage = (): ReactElement => {
  const goals = useAppSelector(selectAllGoals);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  const handleAddColumn = (title: string): void => {
    dispatch(addGoal(title));
  };

  return (
    <SimpleBar
      autoHide={false}
      style={{
        marginRight: '20px',
        marginLeft: '20px',
        padding: '20px',
        maxHeight: '90%',
      }}
    >
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        spacing={2}
        sx={{
          width: 'fit-content',
          minHeight: '90vh',
          border: '2px solid teal',
        }}
      >
        {goals.map(goal => (
          <GoalCard {...goal} key={goal.id} />
        ))}
        <AddItem buttonName="Add column" callback={handleAddColumn} />
      </Stack>
    </SimpleBar>
  );
};
