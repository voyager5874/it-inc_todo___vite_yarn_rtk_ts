import type { FC } from 'react';
import { useState } from 'react';

import { CalendarMonth } from '@mui/icons-material';
import { Box, Button, Checkbox, FormControlLabel, Menu, TextField } from '@mui/material';
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addDays, formatISO } from 'date-fns';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import type { DateRange } from 'mui-daterange-picker';
import { DateRangePicker } from 'mui-daterange-picker';

import { useAppDispatch } from 'app/hooks';
import { updateTask } from 'features/tasks/tasksSlice';
import type { TaskServerModelType } from 'services/api/types';

type TaskDateMenuPropsType = {
  task: TaskServerModelType;
  open: boolean;
};

export const TaskDatesMenu: FC<TaskDateMenuPropsType> = ({ task }) => {
  const { id, todoListId, startDate, deadline, title } = task;

  // const popupState = usePopupState({ variant: 'popper', popupId: 'taskDatesMenu' });
  const [pickedStartDate, setPickedStartDate] = useState<Date | null>(
    startDate ? new Date(startDate) : new Date(),
  );
  const [pickedDeadline, setPickedDeadline] = useState<Date | null>(
    deadline ? new Date(deadline) : addDays(new Date(), 1),
  );

  // const [taskTimeRange, setTaskTimeRange] = useState([pickedStartDate, pickedDeadline]);

  const [startUsed, setStartUsed] = useState(Boolean(startDate));

  const dispatch = useAppDispatch();

  const handleDeadlineChange = (newValue: Date | null): void => {
    if (!newValue) return;
    // const formattedDate = format(newValue, 'MM/dd/yyyy');
    setPickedDeadline(newValue);
  };

  const handleTimeRangeChange = (newValue: DateRange): void => {
    if (!newValue?.startDate || !newValue?.endDate) return;
    // const formattedDate = format(newValue, 'MM/dd/yyyy');
    // setTaskTimeRange(newValue);
    // console.log('from date range picker', newValue);
    setPickedStartDate(newValue.startDate);
    setPickedDeadline(newValue.endDate);
  };

  const handleTaskDatesUpdate = (): void => {
    let startDateIso = null;
    let deadlineDateIso = null;

    if (pickedStartDate) {
      startDateIso = formatISO(pickedStartDate);
    }
    if (pickedDeadline) {
      deadlineDateIso = formatISO(pickedDeadline);
    }
    // if (!startDateIso && !deadlineDateIso) return;
    // +if nothing changed -> return
    // console.log(taskTimeRange);

    dispatch(
      updateTask({
        taskId: id,
        listId: todoListId,
        data: { startDate: startDateIso, deadline: deadlineDateIso, title },
      }),
    );
  };

  const resetDates = () => {
    setPickedStartDate(null);
    setPickedDeadline(null);
  };

  return (
    <PopupState
      variant="popover"
      popupId="task-dates-menu"
      parentPopupState={null}
      disableAutoFocus
    >
      {popupState2 => (
        <Box>
          {/* <Button variant="contained" {...bindTrigger(popupState2)}> */}
          {/*  Toggle Date Menu */}
          {/* </Button> */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<CalendarMonth />}
            sx={{ justifyContent: 'flex-start' }}
            {...bindTrigger(popupState2)}
          >
            Dates
          </Button>
          <Menu
            {...bindMenu(popupState2)}
            sx={{ minWidth: '300px', minHeight: '400px' }}
            anchorOrigin={{
              vertical: 'center',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'center',
              horizontal: 'center',
            }}
          >
            <Box sx={{ height: '40px', width: '100%', backgroundColor: 'black' }}>
              Dates Menu
            </Box>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ minWidth: '300px', minHeight: '300px', padding: '20px' }}>
                {startUsed ? (
                  <DateRangePicker
                    closeOnClickOutside
                    initialDateRange={{
                      startDate: pickedStartDate || undefined,
                      endDate: pickedDeadline || undefined,
                    }}
                    open={popupState2.isOpen}
                    onChange={handleTimeRangeChange}
                    toggle={() => {}}
                  />
                ) : (
                  <StaticDatePicker
                    displayStaticWrapperAs="desktop"
                    value={pickedDeadline}
                    onChange={handleDeadlineChange}
                    renderInput={params => <TextField {...params} />}
                    dayOfWeekFormatter={day => `${day}`}
                  />
                  // <StaticDateRangePicker
                  //   dateAdapter={AdapterDateFns}
                  //   displayStaticWrapperAs="desktop"
                  //   value={[pickedStartDate, pickedDeadline]}
                  //   onChange={handleTimeRangeChange}
                  //   renderInput={(
                  //     startProps: TextFieldProps,
                  //     endProps: TextFieldProps,
                  //   ) => (
                  //     <>
                  //       <TextField {...startProps} />
                  //       <Box sx={{ mx: 2 }}> to </Box>
                  //       <TextField {...endProps} />
                  //     </>
                  //   )}
                  // />
                )}
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={() => setStartUsed(!startUsed)}
                      checked={startUsed}
                    />
                  }
                  label="Start date"
                />
                <Button onClick={handleTaskDatesUpdate}>save</Button>
                <Button onClick={resetDates}>clear dates</Button>
              </Box>
            </LocalizationProvider>
          </Menu>
        </Box>
      )}
    </PopupState>
  );
};
