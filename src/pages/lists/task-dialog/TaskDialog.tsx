import type { FC, ReactElement } from 'react';

import {
  Beenhere,
  CalendarMonth,
  DateRange,
  KeyboardArrowDown,
  ReadMore,
} from '@mui/icons-material';
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { isFulfilled } from '@reduxjs/toolkit';
import { format } from 'date-fns';
import { useFormik } from 'formik';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { bindToggle, usePopupState } from 'material-ui-popup-state/hooks';
import * as yup from 'yup';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { selectListTitle } from 'features/lists';
import { selectTaskBylId, selectTaskTitle, updateTask } from 'features/tasks/tasksSlice';
import { TaskDatesMenuContent } from 'pages/lists/task-dates-menu/TaskDatesMenuContent';
import {
  SERVER_ENTITY_MAX_TITLE_LENGTH,
  SERVER_TASK_MAX_DESCRIPTION_LENGTH,
} from 'services/api/constants';
import { TaskStatus } from 'services/api/enums';

type ListDialogPropsType = {
  open: boolean;
  setOpen: (value: boolean) => void;
  listId: string;
  taskId: string;
};

const validationSchema = yup.object({
  title: yup
    .string()
    .min(4, 'at least four symbols')
    .max(SERVER_ENTITY_MAX_TITLE_LENGTH, '100 symbols max')
    .required('title is required'),
  description: yup.string().max(SERVER_TASK_MAX_DESCRIPTION_LENGTH, '1000 symbols max'),
});

// const dummyTask: TaskServerModelType = {
//   title: 'undefined',
//   id: 'undefined',
//   todoListId: 'undefined',
//   startDate: null,
//   deadline: null,
//   description: null,
//   addedDate: 'undefined',
//   order: 0,
//   priority: 0,
//   status: 0,
// };

export const TaskDialog: FC<ListDialogPropsType> = ({
  open,
  setOpen,
  listId,
  taskId,
}): ReactElement => {
  const taskTitle = useAppSelector(state => selectTaskTitle(state, taskId));
  const task = useAppSelector(state => selectTaskBylId(state, taskId));
  const listName = useAppSelector(state => selectListTitle(state, listId));

  const popupState = usePopupState({ variant: 'popper', popupId: 'taskDatesPopper' });
  // const [startDate, setStartDate] = useState<Date | null>(
  //   task?.startDate ? new Date(task?.startDate) : new Date(),
  // );

  // console.log('useState startDate', startDate);
  // console.log('task in the dialog after selector', task);
  // wtf? task is not undefined but taskTitle is ???
  // const [taskTitle, setTaskTitle] = useState<string>(task?.title || '');
  // const [taskTitle, setTaskTitle] = useState<string>('');
  // this is rather a kludge
  // useEffect(() => {
  //   if (!task?.title) return;
  //   setTaskTitle(task.title);
  // }, [task?.title, taskId]);

  // useEffect(() => {
  //   if (!task?.startDate) return;
  //   const date = new Date(task.startDate);
  //
  //   console.log('startDate server -> store', task.startDate);
  //   console.log('date after new Date', date);
  //   console.log('date.toISOString', date.toISOString());
  //   console.log('date.toLocaleString', date.toLocaleString());
  //
  //   setStartDate(date);
  // }, [task?.startDate, taskId]);

  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues: {
      title: taskTitle || 'no data',
      description: task?.description || '',
    },
    validationSchema,
    onSubmit: async (values, helpers) => {
      if (!taskTitle) return;
      try {
        const res = await dispatch(updateTask({ listId, taskId, data: values }));

        if (isFulfilled(res)) {
          setOpen(false);
          formik.resetForm();
        }
      } finally {
        helpers.setSubmitting(false);
      }
    },
    enableReinitialize: true, // initialValues were undefined without this
  });

  // console.log('formik', formik.values);
  const handleClose = (): void => {
    formik.resetForm();
    setOpen(false);
  };

  // const handleStartDateChange = (newValue: Date | null) => {
  //   if (!newValue) return;
  //   // const formattedDate = format(newValue, 'MM/dd/yyyy');
  //   setStartDate(newValue);
  // };
  //
  // const handleTaskStartDateUpdate = () => {
  //   // const dd = parse(startDate, 'MM/dd/yyyy', new Date());
  //   if (!startDate) return;
  //   const startDateIso = formatISO(startDate);
  //
  //   console.log('useState value before formatISO', startDate);
  //   console.log('sent to server via formatISO', startDateIso);
  //   // const startDateIso = startDate.toISOString();
  //
  //   dispatch(
  //     updateTask({
  //       taskId,
  //       listId,
  //       data: { startDate: startDateIso, title: taskTitle },
  //     }),
  //   );
  // };

  const handleTaskStatusUpdate = (): void => {
    const newStatus =
      task?.status === TaskStatus.Completed
        ? TaskStatus.InProgress
        : TaskStatus.Completed;

    // when providing data with status but without startDate and deadline server sets dates to null
    // sending new dates also resets the status to 0 (new)
    dispatch(
      updateTask({
        taskId,
        listId,
        data: {
          title: taskTitle,
          status: newStatus,
          startDate: task?.startDate,
          deadline: task?.deadline,
        },
      }),
    );
  };

  const renderScheduleButtonContent = (): ReactElement | null => {
    if (!task?.deadline) return null;
    if (task?.startDate && task?.deadline) {
      return (
        <>
          <Box>{format(new Date(task.startDate), 'dd MMM. yyyy')}</Box>
          <Box sx={{ marginLeft: '5px', marginRight: '5px' }}>-</Box>
          <Box>{format(new Date(task.deadline), 'dd MMM. HH:mm yyyy')}</Box>
        </>
      );
    }
    if (!task?.startDate && task?.deadline) {
      // const date = new Date(task.deadline).toLocaleString();
      const date = format(new Date(task.deadline), 'dd MMM. HH:mm yyyy');

      return <Box>{date}</Box>;
    }

    return null;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle component="div" sx={{ maxWidth: '90%' }}>
        <Typography variant="h5" noWrap>
          {taskTitle || 'error getting access to the task'}
        </Typography>
        <Typography variant="subtitle2" sx={{ wordBreak: 'break-word' }}>
          in the {listName} column
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ minHeight: '80vh' }}>
        {/* <DialogContentText>edit task data</DialogContentText> */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: 'grey',
          }}
        >
          <Box
            sx={{
              width: '600px',
              display: 'flex',
              flexDirection: 'column',
              gap: '30px',
            }}
          >
            {(task?.startDate || task?.deadline) && (
              <Stack alignItems="flex-start" gap={2}>
                <Typography variant="body1">Schedule</Typography>
                <PopupState
                  variant="popover"
                  popupId="task-dates-menu"
                  parentPopupState={null}
                  disableAutoFocus
                >
                  {datesPopup => (
                    <>
                      <Stack direction="row">
                        <Checkbox
                          checked={task?.status === TaskStatus.Completed}
                          onChange={handleTaskStatusUpdate}
                        />
                        <Button
                          variant="outlined"
                          startIcon={<CalendarMonth />}
                          sx={{ justifyContent: 'flex-start' }}
                          {...bindTrigger(datesPopup)}
                          endIcon={<KeyboardArrowDown />}
                        >
                          {/* {task?.startDate && ( */}
                          {/*  <Box> */}
                          {/*    {format(new Date(task.startDate), 'dd MMM. yyyy HH:mm')} */}
                          {/*    /!* {new Date(task.startDate).toLocaleString()} *!/ */}
                          {/*  </Box> */}
                          {/* )} */}
                          {/* {task?.startDate && task?.deadline && ( */}
                          {/*  <Box sx={{ marginLeft: '5px', marginRight: '5px' }}>-</Box> */}
                          {/* )} */}
                          {/* {task?.deadline && ( */}
                          {/*  <Box>{new Date(task.deadline).toLocaleString()}</Box> */}
                          {/* )} */}
                          {renderScheduleButtonContent()}
                          <Badge sx={{ backgroundColor: 'green', marginLeft: '20px' }}>
                            {task?.status === TaskStatus.Completed && 'Выполнено'}
                          </Badge>
                        </Button>
                      </Stack>

                      <Menu
                        {...bindMenu(datesPopup)}
                        sx={{
                          minWidth: '300px',
                          minHeight: '400px',
                        }}
                        anchorOrigin={{
                          vertical: 'center',
                          horizontal: 'center',
                        }}
                        transformOrigin={{
                          vertical: 'center',
                          horizontal: 'center',
                        }}
                      >
                        <TaskDatesMenuContent
                          // task={task || dummyTask}
                          id={taskId}
                          todoListId={listId}
                          startDate={task.startDate}
                          deadline={task.deadline}
                          open={datesPopup.isOpen}
                          toggle={datesPopup.toggle}
                        />
                      </Menu>
                    </>
                  )}
                </PopupState>
              </Stack>
            )}

            <form
              onSubmit={formik.handleSubmit}
              style={{
                width: '600px',
                display: 'flex',
                flexDirection: 'column',
                gap: '30px',
              }}
            >
              <TextField
                sx={{ height: '80px' }}
                name="title"
                margin="normal"
                id="task-title"
                // label="Edit task title"
                fullWidth
                // variant="standard"
                value={formik.values.title}
                onChange={formik.handleChange}
                // error={formik.touched.title && Boolean(formik.errors.title)}
                onBlur={formik.handleBlur}
                error={Boolean(formik.errors.title) && formik.touched.title}
                helperText={formik.errors.title || 'Edit task title'}
              />
              <TextField
                sx={{ minHeight: '80px' }}
                multiline
                name="description"
                margin="none"
                id="task-description"
                // label="Edit task description"
                fullWidth
                // variant="standard"
                onBlur={formik.handleBlur}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.errors.description || 'Edit task description'}
              />
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" disabled={formik.isSubmitting}>
                  Save
                </Button>
              </DialogActions>
            </form>
          </Box>

          <Stack
            sx={{ minWidth: '150px' }}
            alignItems="flex-end"
            justifyContent="flex-start"
            gap={3}
          >
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Beenhere />}
              sx={{ justifyContent: 'flex-start' }}
            >
              Labels
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<DateRange />}
              sx={{ justifyContent: 'flex-start' }}
              {...bindToggle(popupState)}
            >
              Dates
            </Button>
            <Menu
              {...bindMenu(popupState)}
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
              <TaskDatesMenuContent
                // task={task || dummyTask}
                id={taskId}
                todoListId={listId}
                startDate={task?.startDate ?? null}
                deadline={task?.deadline ?? null}
                open={popupState.isOpen}
                toggle={popupState.toggle}
              />
            </Menu>
            {/* <TaskDatesMenu task={task || dummyTask} open /> */}
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ReadMore />}
              sx={{ justifyContent: 'flex-start' }}
            >
              Move
            </Button>
            <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
              Move
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
