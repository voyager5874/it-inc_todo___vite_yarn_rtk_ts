import type { FC, MouseEvent } from 'react';
import { useEffect, useState } from 'react';

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
import { bindContextMenu, bindMenu, bindTrigger } from 'material-ui-popup-state';
import { usePopupState } from 'material-ui-popup-state/hooks';

import type { TaskEntityAppType } from 'features/tasks/types';
import { TaskDatesMenuContent } from 'pages/lists/task-dates-menu/TaskDatesMenuContent';

type TaskCardPropsType = TaskEntityAppType & {
  onClick: Function;
};

export const TaskCard: FC<TaskCardPropsType> = ({
  todoListId,
  id,
  title,
  description,
  startDate,
  deadline,
  onClick,
}) => {
  const [cardContentExpanded, setCardContentExpanded] = useState(false);
  const [underAction, setUnderAction] = useState(false);
  // const [contextMenu, setContextMenu] = useState<{
  //   mouseX: number;
  //   mouseY: number;
  // } | null>(null);

  const handleExpandClick = (e: MouseEvent<HTMLSpanElement>): void => {
    e.stopPropagation();
    setCardContentExpanded(!cardContentExpanded);
  };

  const calendarMenuControl = usePopupState({
    variant: 'popover',
    popupId: 'cardCalendarMenu',
  });

  const contextMenuControl = usePopupState({
    variant: 'popover',
    popupId: 'cardRightClickMenu',
  });

  const handleCardClick = (): void => {
    if (contextMenuControl.isOpen || calendarMenuControl.isOpen) return;
    onClick(id);
  };

  useEffect(() => {
    if (!contextMenuControl.isOpen) {
      setUnderAction(false);
    }
  }, [contextMenuControl.isOpen]);

  // useEffect(() => {
  //   if (!calendarMenuControl.isOpen) {
  //     contextMenuControl.close();
  //   }
  // }, [calendarMenuControl.isOpen, contextMenuControl.close]);

  // const handleContextMenu = (event: MouseEvent) => {
  //   event.preventDefault();
  //   setContextMenu(
  //     contextMenu === null
  //       ? {
  //           mouseX: event.clientX + 10,
  //           mouseY: event.clientY - 6,
  //         }
  //       : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
  //         // Other native context menus might behave different.
  //         // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
  //         null,
  //   );
  // };

  const handleOpenContextMenu = (e: MouseEvent): void => {
    e.preventDefault();
    // if (contextMenuControl.isOpen || calendarMenuControl.isOpen) return;
    calendarMenuControl.close();
    // if (contextMenuControl.isOpen) {
    //   contextMenuControl.close();
    // }
    contextMenuControl.toggle(e);

    setUnderAction(true);
  };

  return (
    <Card
      {...bindContextMenu(contextMenuControl)}
      onContextMenu={handleOpenContextMenu}
      onClick={handleCardClick}
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
      <Collapse in={cardContentExpanded} timeout="auto" unmountOnExit>
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
        // open={contextMenu !== null}
        // onClose={handleClose}
        // anchorReference="anchorPosition"
        // anchorPosition={
        //   contextMenu !== null
        //     ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
        //     : undefined
        // }
      >
        <MenuItem>Priority</MenuItem>
        <MenuItem {...bindTrigger(calendarMenuControl)}>Calendar</MenuItem>
        <MenuItem>Move</MenuItem>
        <MenuItem>Delete</MenuItem>
      </Menu>
      <Menu
        {...bindMenu(calendarMenuControl)}
        // onClose={handleCalendarMenuClose}
        // anchorReference="anchorEl"
        anchorOrigin={{ vertical: 'center', horizontal: 'left' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
      >
        <TaskDatesMenuContent
          id={id}
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
