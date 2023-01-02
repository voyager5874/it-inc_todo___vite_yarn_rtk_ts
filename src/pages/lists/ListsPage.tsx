import type { ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Button, Stack } from '@mui/material';
import SimpleBar from 'simplebar-react';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { AddItem } from 'components/AddItem/AddItem';
import {
  addList,
  fetchLists,
  ListPaper,
  selectAllLists,
  selectListsFetchStatus,
} from 'features/lists';

export const ListsPage = (): ReactElement => {
  const [addItemActive, setAddItemActive] = useState(false);

  const fetchAbortRef = useRef<Function | null>(null);

  const lists = useAppSelector(selectAllLists);
  const listsFetchStatus = useAppSelector(selectListsFetchStatus);

  const dispatch = useAppDispatch();

  // const fetchListsThunk = useMemo(
  //   () => bindActionCreators(fetchLists, dispatch),
  //   [dispatch],
  // );

  useEffect(() => {
    const request = () => {
      if (listsFetchStatus === 'failed' || listsFetchStatus === 'idle') {
        return dispatch(fetchLists());
      }
    };

    const promise = request();

    if (promise) {
      fetchAbortRef.current = promise.abort;
    }
    // return () => {
    // if (thunk) thunk.abort();
    // cancel your running thunk before it has finished
    // it will dispatch (and return) a "thunkName/rejected" action (not a Promise!)
    //
    // Should I cancel running network request before unmount?
    // I'm gonna need the data anyway
    // I'm cancelling because of another request which will be made due to react 18 strict mode
    // though condition option within thunk will prevent new request if there is loading: 'succeeded'
    // this two useEffects plus extraneous dependency on lists.loading is rather ugly solution,
    // so I will probably rely on the first fetch request and dismiss the second via condition
    // until rtk query is here
    //
    // fetching in effects means your app can't produce useful html with SSR
    // using framework fetching mechanism or rtk query is the recommended way
    // https://github.com/facebook/react/issues/24502
    // };
  }, [listsFetchStatus, dispatch]);

  useEffect(() => {
    return () => {
      if (fetchAbortRef.current) fetchAbortRef.current();
    };
  }, []);

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
          <ListPaper {...list} key={list.id} />
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
