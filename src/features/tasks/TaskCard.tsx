import type { FC, MouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import { TextSnippet } from '@mui/icons-material';
import {
  Card,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import type { EntityId } from '@reduxjs/toolkit';
import { useConfirm } from 'material-ui-confirm';
import { bindContextMenu, bindMenu, bindTrigger } from 'material-ui-popup-state';
import { usePopupState } from 'material-ui-popup-state/hooks';

import { TEMPORARY_TASK_ID } from 'constants/optimisticUI';
import { deleteTask, selectTaskById } from 'features/tasks';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { TaskDatesMenuContent } from 'pages/lists/task-dates-menu/TaskDatesMenuContent';
import { createDummyTaskObject } from 'utils';

type TaskCardPropsType = {
  listId: EntityId;
  taskId: EntityId;
  onClick: Function;
};

export const TaskCard: FC<TaskCardPropsType> = ({ taskId, onClick }) => {
  // const { todoListId, title, description, startDate, deadline } = useAppSelector(state =>
  //   selectTaskById(state, taskId),
  // );
  const task = useAppSelector(state => selectTaskById(state, taskId));
  const { todoListId, title, description, startDate, deadline } =
    task || createDummyTaskObject();

  const [cardContentExpanded, setCardContentExpanded] = useState(false);
  const [underAction, setUnderAction] = useState(false);

  const dispatch = useAppDispatch();

  const cardRef = useRef<Element | null>(null);

  const confirm = useConfirm();

  const handleExpandClick = (e: MouseEvent<HTMLSpanElement>): void => {
    e.stopPropagation();
    setCardContentExpanded(!cardContentExpanded);
  };

  const contextMenuControl = usePopupState({
    variant: 'popover',
    popupId: 'cardRightClickMenu',
  });

  const calendarMenuControl = usePopupState({
    variant: 'popover',
    popupId: 'cardCalendarMenu',
  });

  const cardOnLeftClick = (): void => {
    // user potentially could add another task if the connection is really slow
    if (String(taskId).includes(TEMPORARY_TASK_ID)) return;
    if (contextMenuControl.isOpen || calendarMenuControl.isOpen) return;
    onClick(taskId);
  };

  const cardOnRightClick = (e: MouseEvent): void => {
    e.preventDefault();
    calendarMenuControl.close();
    cardRef.current = e.currentTarget;
    contextMenuControl.toggle(e);
    setUnderAction(true);
  };

  useEffect(() => {
    if (!contextMenuControl.isOpen && !calendarMenuControl.isOpen) {
      setUnderAction(false);
    }
  }, [contextMenuControl.isOpen, calendarMenuControl.isOpen]);

  const handleOpenCalendarMenu = (e: MouseEvent): void => {
    e.preventDefault();
    if (!cardRef.current) return;
    calendarMenuControl.open(cardRef.current);
    contextMenuControl.close();
  };

  const handleTaskDelete = (): void => {
    contextMenuControl.close();

    confirm({
      title: 'Delete task',
      description: `Delete ${title}? This action is permanent.`,
    }).then(() => {
      dispatch(deleteTask({ listId: todoListId, taskId }));
    });
    // .catch(() => contextMenuControl.close());
  };

  return (
    <Card
      {...bindContextMenu(contextMenuControl)}
      onContextMenu={cardOnRightClick}
      onClick={cardOnLeftClick}
      sx={[
        {
          backgroundColor: underAction ? 'purple' : '',
          wordWrap: 'break-word',
          cursor: 'pointer',
          marginBottom: '8px',
          // marginRight: '20px',
          // padding: '10px',
        },
        theme => ({
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }),
      ]}
    >
      {/* <CardMedia */}
      {/*  component="img" */}
      {/*  height="140" */}
      {/*  image="https://img.freepik.com/free-photo/blue-iguana-closeup-on-wood_488145-647.jpg?w=2000" */}
      {/*  alt="green iguana" */}
      {/* /> */}
      <CardContent>
        <Typography gutterBottom variant="subtitle1" component="div">
          {title}
        </Typography>
        {description && description.length < 50 && (
          <Typography paragraph color="text.secondary">
            {description}
          </Typography>
        )}
      </CardContent>
      <CardActions disableSpacing>
        {description && description.length > 50 && (
          <Tooltip title="this task has description">
            <IconButton
              sx={{ borderRadius: '4px', zIndex: '10' }}
              onClick={handleExpandClick}
            >
              <TextSnippet />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
      <Collapse in={cardContentExpanded} timeout="auto">
        <CardContent>
          <Typography paragraph color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Collapse>
      <Menu
        {...bindMenu(contextMenuControl)}
        anchorReference="anchorEl"
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
      >
        <MenuItem>Priority</MenuItem>
        <MenuItem {...bindTrigger(calendarMenuControl)} onClick={handleOpenCalendarMenu}>
          Calendar
        </MenuItem>
        <MenuItem>Move</MenuItem>
        <MenuItem onClick={handleTaskDelete}>Delete</MenuItem>
      </Menu>
      <Menu
        {...bindMenu(calendarMenuControl)}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
      >
        <TaskDatesMenuContent
          id={taskId}
          todoListId={todoListId}
          startDate={startDate}
          deadline={deadline}
          open={calendarMenuControl.isOpen}
          toggle={calendarMenuControl.toggle}
        />
      </Menu>
    </Card>
  );
};
