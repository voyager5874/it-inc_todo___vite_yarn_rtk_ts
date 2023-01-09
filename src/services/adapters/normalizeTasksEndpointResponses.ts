import type {
  TaskServerModelType,
  TasksEndpointGetResponseType,
} from 'services/api/types';

// date-fns formatISO formats date as (local time +- offset; (msk -> time+03:00)
// server respond with converted to GMT time [msk => sent time - 3 hours]+00:00
// but saves only converted to GMT time, ie 18:00msk -> 15:00 (no time zone info)
// startDateIso = start.toISOString(); // subtracts timezone offset and adds 'Z'
// server respond with this date-time exactly but saves the string without Z
// if the server assumes GMT time, I need to force adding GMT marker within getter functions,
// and it'll be converted to local time with new Date call
// formatInTimeZone(new Date(task.deadline), 'Europe/Moscow', 'yyyy-MM-dd HH:mm') could also be used

const normalizeDateTimeString = (tasks: TaskServerModelType[]): TaskServerModelType[] => {
  if (!tasks.length) return tasks;

  return tasks.map(task => {
    if (!task.startDate && !task.deadline) {
      return { ...task, addedDate: `${task.addedDate}+00:00` };
    }
    let start = task.startDate;
    let end = task.deadline;
    const added = `${task.addedDate}+00:00`;

    if (task.startDate && !task.startDate.includes('+')) {
      start = `${start}+00:00`;
    }
    if (task.deadline && !task.deadline.includes('+')) {
      end = `${end}+00:00`;
    }

    return { ...task, startDate: start, deadline: end, addedDate: added };
  });
};

const reverseTasksOrder = (tasks: TaskServerModelType[]): TaskServerModelType[] => {
  // return tasks.sort((a, b) => a.order - b.order);
  return tasks.reverse();
};

export const normalizeTasksGetResponseData = (
  data: TasksEndpointGetResponseType,
): TasksEndpointGetResponseType => {
  const { items } = data;
  const orderedItems = reverseTasksOrder(items);

  return {
    items: normalizeDateTimeString(orderedItems),
    error: data.error,
    totalCount: data.totalCount,
  };
};
