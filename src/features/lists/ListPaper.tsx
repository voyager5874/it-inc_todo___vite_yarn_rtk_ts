import type { FC, MouseEvent, ReactElement } from 'react';
import { useEffect, useState } from 'react';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { IconButton, List, Menu, MenuItem, Paper, Stack } from '@mui/material';
import SimpleBar from 'simplebar-react';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { AddItem } from 'components/AddItem/AddItem';
import { EditableText } from 'components/EditableText/EditableText';
import { deleteList, updateList } from 'features/lists/listsSlice';
import type { ListEntityAppType } from 'features/lists/types';
import { TaskCard } from 'features/tasks/TaskCard';
import { addTask, fetchTasks, selectTasksByListId } from 'features/tasks/tasksSlice';
import { TaskDialog } from 'pages/lists/task-dialog/TaskDialog';
import type { TasksEndpointPostPutModelDataType } from 'services/api/types';

export const ListPaper: FC<ListEntityAppType> = ({ title, id }): ReactElement => {
  const tasks = useAppSelector(state => selectTasksByListId(state, id));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchTasks(id));
  }, [id, dispatch]);

  const handleAddTask = (taskTitle: string): void => {
    const taskData: TasksEndpointPostPutModelDataType = { title: taskTitle };

    dispatch(addTask({ listId: id, data: taskData }));
  };

  const handleMenu = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseListMenu = (): void => {
    setAnchorEl(null);
  };

  const handleDeleteList = (): void => {
    // dispatch(deleteList('2df82085-3d35-4b4f-9540-309f950078f7'));
    dispatch(deleteList(id));
    handleCloseListMenu();
  };

  const handleOpenListDialog = (taskId: string): void => {
    console.log('handleOpenListDialog', taskId);
    setSelectedTaskId(taskId);
    setDialogOpen(true);
  };

  const handleListTitleUpdate = (newTitle: string): void => {
    dispatch(updateList({ listId: id, data: { title: newTitle } }));
  };

  return (
    <Paper
      sx={[
        {
          minWidth: '320px',
          padding: '10px 5px 10px 10px',
          maxHeight: '85vh',
          maxWidth: '400px',
        },
        theme => ({
          backgroundColor:
            theme.palette.mode === 'light'
              ? theme.palette.grey[300]
              : theme.palette.grey[900],
        }),
      ]}
      elevation={2}
    >
      <Stack
        direction="row"
        gap={2}
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ padding: '10px 20px 10px 10px' }}
      >
        {/* <Typography variant="h5" sx={{ wordBreak: 'break-word' }}> */}
        {/*  {title} */}
        {/* </Typography> */}
        <EditableText text={title} submitCallback={handleListTitleUpdate} />
        <IconButton
          sx={{ borderRadius: '0.2em' }}
          aria-label="list menu"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
        >
          <MoreHorizIcon />
        </IconButton>
        <Menu
          id="menu-list"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          open={Boolean(anchorEl)}
          onClose={handleCloseListMenu}
        >
          <MenuItem onClick={handleDeleteList}>Delete List</MenuItem>
          <MenuItem onClick={handleCloseListMenu}>Add task</MenuItem>
        </Menu>
      </Stack>

      <List sx={{ overflowY: 'auto' }}>
        <SimpleBar autoHide={false} style={{ maxHeight: '72vh', paddingRight: '20px' }}>
          {/* <AddItem buttonName="add task" callback={handleAddTask} templateButton /> */}
          {(tasks || []).map(task => (
            <TaskCard {...task} key={task.id} onClick={handleOpenListDialog} />
          ))}
        </SimpleBar>
      </List>
      <AddItem buttonName="add task" callback={handleAddTask} extraControls />
      <TaskDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        listId={id}
        taskId={selectedTaskId!}
      />
    </Paper>
  );
};
