import type { EntityState } from '@reduxjs/toolkit';

import type { EntityLoadingStatusType } from 'app';
import type { ListServerModelType, TaskServerModelType } from 'services/api';

// Eventually I need to make ListEntityAppType the only type for the app, this extra TodolistEntryType is for the time of refactoring
export type TodolistEntryType = ListServerModelType & {
  tasksTotalCount: null | number;
  tasks: EntityState<TaskServerModelType> & { loading: EntityLoadingStatusType };
};
