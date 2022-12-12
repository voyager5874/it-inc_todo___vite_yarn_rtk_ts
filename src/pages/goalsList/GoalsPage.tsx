import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { Container } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { fetchGoals, GoalCard, selectAllGoals } from 'features/goals';

export const GoalsPage = (): ReactElement => {
  const goals = useAppSelector(selectAllGoals);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchGoals());
  }, []);

  return (
    <Container sx={{ padding: '50px' }}>
      <h2>Goals page </h2>
      <Grid2 container>
        <Grid2 sx={{ display: 'flex', gap: '20px' }}>
          {goals.map(goal => (
            <GoalCard {...goal} key={goal.id} />
          ))}
        </Grid2>
      </Grid2>
    </Container>
  );
};
