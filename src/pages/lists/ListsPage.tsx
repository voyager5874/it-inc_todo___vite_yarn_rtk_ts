import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Button, Stack } from '@mui/material';
import SimpleBar from 'simplebar-react';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { AddItem } from 'components/AddItem/AddItem';
import { addList, fetchLists, ListPaper, selectAllLists } from 'features/lists';

export const ListsPage = (): ReactElement => {
  const [addItemActive, setAddItemActive] = useState(false);

  const lists = useAppSelector(selectAllLists);

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
        {lists.map(list => (
          <ListPaper id={list.id} title={list.title} key={list.id} />
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
