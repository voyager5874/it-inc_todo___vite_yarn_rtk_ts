import type { FC, MouseEvent } from 'react';
import { useState } from 'react';

import { TextSnippet } from '@mui/icons-material';
import {
  Card,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';

import type { TaskEntityAppType } from 'features/tasks/types';

type TaskCardPropsType = TaskEntityAppType & {
  onClick: Function;
};

export const TaskCard: FC<TaskCardPropsType> = ({ id, title, description, onClick }) => {
  const [cardContentExpanded, setCardContentExpanded] = useState(false);

  const handleExpandClick = (e: MouseEvent<HTMLSpanElement>): void => {
    e.stopPropagation();
    setCardContentExpanded(!cardContentExpanded);
  };

  const handleCardClick = (): void => {
    onClick(id);
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={[
        {
          zIndex: '9',
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
    </Card>
  );
};
