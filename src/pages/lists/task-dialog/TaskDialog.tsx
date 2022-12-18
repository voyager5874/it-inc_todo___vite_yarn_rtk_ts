import type { FC, ReactElement } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { selectListTitle } from 'features/lists';
import { selectTaskBylId, selectTaskTitle, updateTask } from 'features/tasks/tasksSlice';
import {
  SERVER_ENTITY_MAX_TITLE_LENGTH,
  SERVER_TASK_MAX_DESCRIPTION_LENGTH,
} from 'services/api/constants';

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

export const TaskDialog: FC<ListDialogPropsType> = ({
  open,
  setOpen,
  listId,
  taskId,
}): ReactElement => {
  console.log('taskId in Dialog', taskId);
  const taskTitle = useAppSelector(state => selectTaskTitle(state, taskId));
  const task = useAppSelector(state => selectTaskBylId(state, taskId));
  const listName = useAppSelector(state => selectListTitle(state, listId));

  console.log('task in the dialog after selector', task);
  // wtf? task is not undefined but taskTitle is ???
  // const [taskTitle, setTaskTitle] = useState<string>(task?.title || '');
  // const [taskTitle, setTaskTitle] = useState<string>('');
  // this is rather a kludge
  // useEffect(() => {
  //   if (!task?.title) return;
  //   setTaskTitle(task.title);
  // }, [task?.title, taskId]);

  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues: {
      title: taskTitle || 'no data',
      description: task?.description || '',
    },
    validationSchema,
    onSubmit: async (values, helpers) => {
      if (!taskTitle) return;
      await dispatch(updateTask({ listId, taskId, data: values }));
      helpers.setSubmitting(false);
      setOpen(false);
    },
    enableReinitialize: true, // initialValues were undefined without this
  });

  console.log('formik', formik.values);
  const handleClose = (): void => {
    formik.resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle component="div">
        <Typography variant="h5" noWrap>
          {taskTitle || 'error getting access to the task'}
        </Typography>
        <Typography variant="subtitle2" sx={{ wordBreak: 'break-word' }}>
          in the {listName} column
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ minWidth: '100%' }}>
        <DialogContentText>edit task data</DialogContentText>
        <form
          onSubmit={formik.handleSubmit}
          style={{
            width: '500px',
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
      </DialogContent>
    </Dialog>
  );
};
