import type { FC, ReactElement, MouseEvent } from 'react';
import { useEffect, useState } from 'react';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  IconButton,
  List,
  ListItem,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import SimpleBar from 'simplebar-react';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { AddItem } from 'components/AddItem/AddItem';
import { deleteList } from 'features/lists/listsSlice';
import type { GoalEntityAppType } from 'features/lists/types';
import { addTask, fetchTasks, selectTasksByGoalId } from 'features/tasks/tasksSlice';
import type { TaskEndpointPostPutModelDataType } from 'services/api/types';

export const ListCard: FC<GoalEntityAppType> = ({ title, id }): ReactElement => {
  const tasks = useAppSelector(state => selectTasksByGoalId(state, id));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchTasks(id));
  }, [id, dispatch]);

  const handleAddTask = (taskTitle: string): void => {
    const taskData: TaskEndpointPostPutModelDataType = { title: taskTitle };

    dispatch(addTask({ goalId: id, data: taskData }));
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

  return (
    <Paper
      sx={{ minWidth: '300px', padding: '20px', maxHeight: '85vh', maxWidth: '400px' }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ backgroundColor: 'background.default', padding: '10px' }}
      >
        <Typography variant="h5">{title}</Typography>
        <IconButton
          aria-label="list menu"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
        >
          <MoreHorizIcon />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleCloseListMenu}
        >
          <MenuItem onClick={handleDeleteList}>Delete List</MenuItem>
          <MenuItem onClick={handleCloseListMenu}>Add task</MenuItem>
        </Menu>
      </Stack>

      <List sx={{ overflowY: 'auto', backgroundColor: 'red' }}>
        <SimpleBar autoHide={false} style={{ maxHeight: '72vh' }}>
          {(tasks || []).map(task => (
            <ListItem key={task.id}>{task.title}</ListItem>
          ))}
        </SimpleBar>
      </List>
      <AddItem buttonName="add task" callback={handleAddTask} />
    </Paper>
  );
};
