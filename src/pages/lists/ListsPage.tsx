import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { Stack } from '@mui/material';
import SimpleBar from 'simplebar-react';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { AddItem } from 'components/AddItem/AddItem';
import { addList, fetchLists, ListCard, selectAllLists } from 'features/lists';

export const ListsPage = (): ReactElement => {
  const goals = useAppSelector(selectAllLists);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchLists());
  }, [dispatch]);

  const handleAddColumn = (title: string): void => {
    dispatch(addList(title));
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
          <ListCard {...goal} key={goal.id} />
        ))}
        <AddItem buttonName="Add column" callback={handleAddColumn} />
      </Stack>
    </SimpleBar>
  );
};
