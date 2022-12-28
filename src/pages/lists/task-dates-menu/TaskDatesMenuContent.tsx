import type { ChangeEvent, FC } from 'react';
import { useState } from 'react';

import './TaskDatesMenuContent.css';
import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  DesktopTimePicker,
  LocalizationProvider,
  StaticDateTimePicker,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  add,
  addDays,
  addYears,
  compareDesc,
  formatISO,
  startOfDay,
  subYears,
} from 'date-fns';
import type { DateRange } from 'mui-daterange-picker';
import { DateRangePicker } from 'mui-daterange-picker';

import { useAppDispatch } from 'app/hooks';
import { updateTask } from 'features/tasks/tasksSlice';

type TaskDateMenuContentPropsType = {
  // task: TaskServerModelType;
  id: string;
  todoListId: string;
  startDate: string | null;
  deadline: string | null;
  open: boolean;
  toggle: () => void;
};

const determineStartDate = (dateString: string | null | undefined): Date => {
  return dateString ? new Date(dateString) : startOfDay(new Date());
};

const determineDeadline = (
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): Date => {
  if (startDate && !endDate) {
    const start = new Date(startDate);

    return addDays(start, 1);
  }
  if (endDate && startDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (compareDesc(end, start) < 0) {
      return end;
    }
  }
  if (endDate && !startDate) {
    return new Date(endDate);
  }

  return addDays(new Date(), 1);
};

export const TaskDatesMenuContent: FC<TaskDateMenuContentPropsType> = ({
  // task,
  id,
  todoListId,
  startDate,
  deadline,
  open,
  toggle,
}) => {
  // const { id, todoListId, startDate, deadline } = task;

  const [pickedStartDate, setPickedStartDate] = useState<Date | null>(
    determineStartDate(startDate),
  );

  const [pickedDeadline, setPickedDeadline] = useState<Date | null>(
    determineDeadline(startDate, deadline),
  );

  const [startUsed, setStartUsed] = useState(Boolean(startDate));

  const dispatch = useAppDispatch();

  const defineMenuTitle = (): string => {
    if (deadline && startUsed) {
      return 'Change task schedule';
    }
    if (!deadline && startUsed) {
      return 'Set task time-frame';
    }
    if (deadline && !startUsed) {
      return 'Change task due date';
    }
    if (!deadline && !startUsed) {
      return 'Set task due date';
    }

    return 'Task schedule';
  };

  const handleDeadlineChange = (newValue: Date | null): void => {
    if (!newValue) return;
    setPickedDeadline(newValue);
  };

  const handleTimeRangeChange = (newValue: DateRange): void => {
    if (!newValue?.startDate || !newValue?.endDate) return;
    setPickedStartDate(newValue.startDate);
    setPickedDeadline(newValue.endDate);
  };

  const handleTaskDatesUpdate = (
    start: Date | null = pickedStartDate,
    end: Date | null = pickedDeadline,
  ): void => {
    let startDateIso: string | null = null;
    let deadlineDateIso: string | null = null;

    if (startUsed && start) {
      startDateIso = formatISO(start);
      // date-fns formatISO formats date as (local time +- offset; (msk -> +03:00)
      // server respond with (converted to GMT time)+00:00 but saves only converted to GMT time, ie 18:00msk -> 15:00
      // startDateIso = start.toISOString(); // subtracts timezone offset and adds 'Z'
      // server respond with this date-time exactly but saves the string without Z
      // locally if there is no timezone identifiers (Z or HH:mm) the time renders as it is, offsets not used (Chrome specific?)
      // w3schools - 'When getting a date, without specifying the time zone, the result is converted to the browser's time zone.
      // In other words: If a date/time is created in GMT (Greenwich Mean Time), the date/time will
      // be converted to CDT (Central US Daylight Time) if a user browses from central US.' - I don't see a conversion
      // Omitting T or Z in a date-time string can give different results in different browsers.
    }
    if (end) {
      deadlineDateIso = formatISO(end);
    }
    dispatch(
      updateTask({
        taskId: id,
        listId: todoListId,
        data: { startDate: startDateIso, deadline: deadlineDateIso },
      }),
    );
    toggle();
  };

  const resetDates = (): void => {
    setPickedStartDate(null);
    setPickedDeadline(null);
    handleTaskDatesUpdate(null, null);
    toggle();
  };

  const handleSwitchScheduleMode = (event: ChangeEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    setStartUsed(!startUsed);
  };

  const changeDueTime = (time: Date | null): void => {
    setPickedDeadline(time);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          minWidth: '300px',
          minHeight: '300px',
          padding: '0px 20px 20px 20px',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography>{defineMenuTitle()}</Typography>
          <IconButton onClick={toggle}>
            <Close />
          </IconButton>
        </Stack>
        {startUsed ? (
          <Box sx={{ minHeight: '350px', overflow: 'hidden' }}>
            <DateRangePicker
              initialDateRange={{
                startDate: pickedStartDate || undefined,
                endDate: pickedDeadline || undefined,
              }}
              closeOnClickOutside={false}
              open={open}
              onChange={handleTimeRangeChange}
              toggle={() => {}}
              definedRanges={[]}
              maxDate={addYears(new Date(), 3)}
              minDate={subYears(new Date(), 3)}
            />
            <Box sx={{ mt: 2 }}>
              <DesktopTimePicker
                showToolbar
                closeOnSelect
                ampm={false}
                label="Due time"
                value={
                  pickedDeadline || add(startOfDay(new Date()), { days: 1, hours: 12 })
                }
                onChange={changeDueTime}
                renderInput={params => <TextField {...params} />}
              />
            </Box>
          </Box>
        ) : (
          // <StaticDatePicker
          //   displayStaticWrapperAs="desktop"
          //   value={pickedDeadline}
          //   onChange={handleDeadlineChange}
          //   renderInput={params => <TextField {...params} />}
          //   dayOfWeekFormatter={day => `${day}`}
          // />
          <StaticDateTimePicker
            ampm={false}
            hideTabs={false}
            showToolbar
            label={deadline ? 'Current due date' : 'Due date not set yet'}
            value={pickedDeadline || add(startOfDay(new Date()), { days: 1, hours: 12 })}
            onChange={handleDeadlineChange}
            // displayStaticWrapperAs="desktop"
            renderInput={params => <TextField {...params} />}
            components={
              {
                // PaperContent: DummyComponent,
                // ActionBar: PickerControls
                // LeftArrowIcon: AlarmIcon,
                // RightArrowIcon: SnoozeIcon,
                // OpenPickerIcon: ClockIcon,
              }
            }
            onAccept={() => handleTaskDatesUpdate()}
            componentsProps={{
              actionBar: {
                // The actions will be the same between desktop and mobile
                // actions: ['accept', 'clear', 'cancel'],
                actions: [],

                // The actions will be different between desktop and mobile
                // actions: variant => (variant === 'desktop' ? [] : ['clear']),
              },
            }}
          />
        )}
        <Stack direction="row" mt={2}>
          <FormControlLabel
            control={<Checkbox onChange={handleSwitchScheduleMode} checked={startUsed} />}
            label="Start date"
          />
          <Button onClick={() => handleTaskDatesUpdate()}>save</Button>
          <Button onClick={resetDates}>clear dates</Button>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};

// const DummyComponent = ({ children }) => {
//   return (
//     <Box>
//       {children}
//       <Stack direction="row">
//         <FormControlLabel control={<Checkbox />} label="Start date" />
//         <Button>save</Button>
//         <Button>clear dates</Button>
//       </Stack>
//     </Box>
//   );
// };
