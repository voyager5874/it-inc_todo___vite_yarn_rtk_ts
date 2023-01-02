import type { ReactElement } from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { Add, Style } from '@mui/icons-material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Box, Button, IconButton, List, Menu, MenuItem, Paper } from '@mui/material';
import { useConfirm } from 'material-ui-confirm';
import { bindMenu, bindToggle } from 'material-ui-popup-state';
import { usePopupState } from 'material-ui-popup-state/hooks';
import SimpleBar from 'simplebar-react';
import useResizeObserver from 'use-resize-observer';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { AddItem } from 'components/AddItem/AddItem';
import { EditableText } from 'components/EditableText/EditableText';
import { deleteList, updateList } from 'features/lists/listsSlice';
import type { ListEntityAppType } from 'features/lists/types';
import { TaskCard } from 'features/tasks/TaskCard';
import { addTask, fetchTasks, selectTasksByListId } from 'features/tasks/tasksSlice';
import { TaskDialog } from 'pages/lists/task-dialog/TaskDialog';
import type { TasksEndpointPostPutModelDataType } from 'services/api/types';

export const ListPaper = memo(({ title, id }: ListEntityAppType): ReactElement => {
  const tasks = useAppSelector(state => selectTasksByListId(state, id));

  const [dialogOpen, setDialogOpen] = useState<boolean>(false); // use popup-state
  const [addFormActive, setAddFormActive] = useState<boolean>(false);

  const scrollableNodeRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<SimpleBar>(null);
  const selectedTaskId = useRef<string | null>(null);

  const { ref: titleBox, height: titleBoxHeight } = useResizeObserver<HTMLDivElement>();

  const listMenuControl = usePopupState({
    variant: 'popover',
    popupId: 'list-menu',
  });

  const confirm = useConfirm();

  const dispatch = useAppDispatch();

  useEffect(() => {
    const thunk = dispatch(fetchTasks(id));

    return () => {
      thunk.abort();
    };
  }, [id, dispatch]);

  const toggleForm = (): void => {
    setAddFormActive(prev => !prev);
  };

  const handleAddTask = (taskTitle: string): void => {
    const taskData: TasksEndpointPostPutModelDataType = { title: taskTitle };

    dispatch(addTask({ listId: id, data: taskData }));
    // toggleForm();
  };

  const handleDeleteList = (): void => {
    // dispatch(deleteList('2df82085-3d35-4b4f-9540-309f950078f7')); // this is for generating an error
    listMenuControl.close();
    confirm({
      title: 'Delete list',
      description: `Delete ${title}? This action is permanent.`,
    }).then(() => dispatch(deleteList(id)));
  };

  const handleOpenListDialog = (taskId: string): void => {
    selectedTaskId.current = taskId;
    setDialogOpen(true); // use popup-state?
  };

  const handleListTitleUpdate = useCallback(
    (newTitle: string): Promise<any> => {
      // The thunks generated by createAsyncThunk will always return a resolved promise
      // with either the fulfilled action object or rejected action object inside, as appropriate.
      // hence unwrap()
      return dispatch(updateList({ listId: id, data: { title: newTitle } })).unwrap();
    },
    [id, dispatch],
  );

  // if the component were to submit only the new text this would be a good option
  // const handleListTitleUpdate = useMemo(
  //   () => bindActionCreators(updateList, dispatch),
  //   [dispatch],
  // );

  useEffect(() => {
    if (!scrollableNodeRef.current || !addFormActive) return;

    scrollableNodeRef.current.scroll({ top: scrollableNodeRef.current.scrollHeight });
  }, [addFormActive]);

  return (
    <Paper
      sx={[
        {
          position: 'relative',
          padding: '10px 5px 10px 10px',
          // maxHeight: '8vh',
          width: '350px',
        },
        theme => ({
          backgroundColor:
            theme.palette.mode === 'dark'
              ? theme.palette.grey[900]
              : theme.palette.grey[300],
        }),
      ]}
      elevation={2}
    >
      <Box ref={titleBox} sx={{ padding: '0px 45px 10px 10px', width: '100%' }}>
        <EditableText text={title} submitCallback={handleListTitleUpdate} />
        <IconButton
          sx={{ borderRadius: '0.2em', position: 'absolute', top: '3px', right: '3px' }}
          aria-label="list menu"
          aria-haspopup="true"
          {...bindToggle(listMenuControl)}
        >
          <MoreHorizIcon />
        </IconButton>
        <Menu
          {...bindMenu(listMenuControl)}
          // anchorOrigin={{
          //   vertical: 'top',
          //   horizontal: 'right',
          // }}
          // transformOrigin={{
          //   vertical: 'top',
          //   horizontal: 'left',
          // }}
        >
          <MenuItem onClick={handleDeleteList}>Delete List</MenuItem>
          <MenuItem onClick={listMenuControl.close}>Add task</MenuItem>
        </Menu>
      </Box>

      <List sx={{ overflowY: 'auto' }}>
        <SimpleBar
          scrollableNodeProps={{ ref: scrollableNodeRef }}
          autoHide={false}
          style={{
            maxHeight: addFormActive
              ? `calc(75vh + 48px - ${titleBoxHeight}px)`
              : `calc(75vh - ${titleBoxHeight}px)`,
            paddingRight: '20px',
          }}
          ref={scrollbarRef}
        >
          {tasks.map(task => (
            <TaskCard {...task} key={task.id} onClick={handleOpenListDialog} />
          ))}
          {addFormActive && (
            <AddItem
              // refProp={scrollAnchor}
              submit={handleAddTask}
              extraControls
              buttonName="Add task"
              hide={toggleForm}
            />
          )}
        </SimpleBar>
      </List>

      <Box
        sx={{
          // backgroundColor: 'grey',
          height: '48px',
          marginRight: '20px',
          minWidth: '250px',
          // display: 'flex',
          gap: '7px',
          display: addFormActive ? 'none' : 'flex',
          alignItems: 'center',
        }}
      >
        <Button
          onClick={toggleForm}
          sx={{
            padding: '7px 20px 7px 20px',
            justifyContent: 'flex-start',
            flexGrow: 1,
          }}
          variant="text"
          startIcon={<Add />}
        >
          Add task
        </Button>

        <IconButton sx={{ borderRadius: '0.2em' }}>
          <Style />
        </IconButton>
      </Box>
      <TaskDialog
        open={dialogOpen && Boolean(selectedTaskId.current)}
        setOpen={setDialogOpen}
        listId={id}
        taskId={selectedTaskId.current!}
      />
    </Paper>
  );
});
