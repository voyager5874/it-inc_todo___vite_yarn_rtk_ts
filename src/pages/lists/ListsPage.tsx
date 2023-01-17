import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import SimpleBar from 'simplebar-react';

import { ListPaper } from './ListPaper';

import { AddItem } from 'components/AddItem/AddItem';
import { addList, fetchLists, selectListsIds } from 'features/lists';
import { selectTasksLoadingStatus } from 'features/tasks';
import { useAppDispatch, useAppSelector } from 'hooks/redux';

export const ListsPage = (): ReactElement => {
  const [addItemActive, setAddItemActive] = useState(false);

  // const lists = useAppSelector(selectAllLists);
  const lists = useAppSelector(selectListsIds);
  // when change title all children will be rendered ? -> selectIds/ memo for children
  const loading = useAppSelector(selectTasksLoadingStatus);

  const dispatch = useAppDispatch();

  useEffect(() => {
    // I could listen for state.auth === true
    const request = dispatch(fetchLists());

    return () => {
      request.abort();
    };
  }, [dispatch]);

  const handleAddColumn = (title: string): void => {
    dispatch(addList(title));
  };

  const toggleAddItemActive = (): void => {
    setAddItemActive(prev => !prev);
  };

  if (loading) {
    return (
      <Container
        sx={{
          // backgroundColor: 'red',
          minHeight: '90vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4">Loading data...</Typography>
      </Container>
    );
  }

  return (
    <SimpleBar
      autoHide={false}
      style={{
        marginRight: '20px',
        marginLeft: '20px',
        padding: '20px',
        height: '92vh',
        // border: '2px solid purple',
      }}
    >
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        spacing={2}
        sx={{
          width: 'fit-content',
          minHeight: '90%',
          // border: '2px solid teal',
        }}
      >
        {lists.map(listId => (
          <ListPaper id={listId} key={listId} />
        ))}
        {addItemActive && (
          <AddItem
            buttonName="Add column"
            submit={handleAddColumn}
            backplate
            hide={toggleAddItemActive}
          />
        )}
        <Box
          sx={{
            // backgroundColor: 'grey',
            height: '48px',
            marginRight: '20px',
            minWidth: '250px',
            // display: 'flex',
            gap: '7px',
            display: addItemActive ? 'none' : 'flex',
            alignItems: 'center',
          }}
        >
          <Button
            onClick={toggleAddItemActive}
            sx={{
              padding: '7px 20px 7px 20px',
              justifyContent: 'flex-start',
              flexGrow: 1,
            }}
            variant="text"
            startIcon={<Add />}
          >
            Add Column
          </Button>
        </Box>
      </Stack>
    </SimpleBar>
  );
};
