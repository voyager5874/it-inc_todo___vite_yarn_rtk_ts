import type { FC } from 'react';

import { Badge } from '@mui/material';
import { differenceInHours } from 'date-fns';

import { TASK_DUE_WARN_HOURS_MAX, TASK_DUE_WARN_HOURS_MIN } from 'constants/settings';
import { TaskStatus } from 'services/api/enums';

type TaskCompletionBadgePropsType = {
  status: TaskStatus;
  deadline: string | null;
};

export const TaskCompletionBadge: FC<TaskCompletionBadgePropsType> = ({
  status,
  deadline,
}) => {
  // const daysRemains = deadline
  //   ? differenceInBusinessDays(new Date(deadline), new Date())
  //   : null;
  const hoursRemains = deadline
    ? differenceInHours(new Date(deadline), new Date(), { roundingMethod: 'floor' })
    : null;

  const expired = ():
    | 'Expired'
    | 'Expiring'
    | 'Completed'
    | 'Expires in less than a day'
    | null => {
    if (hoursRemains === null) return null;
    if (
      status !== TaskStatus.Completed &&
      hoursRemains &&
      hoursRemains > TASK_DUE_WARN_HOURS_MIN &&
      hoursRemains < TASK_DUE_WARN_HOURS_MAX
    ) {
      return 'Expiring';
    }
    if (status !== TaskStatus.Completed && hoursRemains && hoursRemains <= 0) {
      return 'Expired';
    }
    if (
      status !== TaskStatus.Completed &&
      hoursRemains &&
      hoursRemains > 0 &&
      hoursRemains <= TASK_DUE_WARN_HOURS_MIN
    ) {
      return 'Expires in less than a day';
    }

    return null;
  };

  const taskExpired = expired();

  // the Badge is somehow renders though taskExpired === null
  let color = status === TaskStatus.Completed ? 'green' : 'transparent';
  // let color = 'green';

  if (expired() === 'Expiring') color = 'yellow'; // get this from theme
  if (expired() === 'Expires in less than a day') color = 'orange';
  if (expired() === 'Expired') color = 'red';

  console.log('TaskCompletionBadge', {
    status,
    deadline,
    timeRemains: hoursRemains,
    color,
    taskExpired,
  });

  return (
    <Badge
      sx={{
        padding: '2px 5px 2px 5px',
        borderRadius: '5px',
        backgroundColor: color,
        marginLeft: '20px',
        // color: theme => theme.palette.getContrastText('warning'),
        color: 'black',
      }}
    >
      {status === TaskStatus.Completed && 'Completed'}
      {taskExpired && taskExpired}
    </Badge>
  );
};
