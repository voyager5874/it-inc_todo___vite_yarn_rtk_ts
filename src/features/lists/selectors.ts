import { createSelector } from '@reduxjs/toolkit';

import type { RootStateType } from 'app';
import { listsAdapter } from 'features/lists/normalizrAdapter';

export const {
  selectAll: selectAllLists,
  selectEntities: selectListEntities,
  selectById: selectListById,
  selectIds: selectListsIds,
} = listsAdapter.getSelectors<RootStateType>(state => state.lists);

export const selectListTitle = createSelector(selectListById, list =>
  list ? list.title : 'list access error',
);

export const selectTasksIdsByListId = createSelector(selectListById, list => {
  return list ? list.tasks : ['selectTasksIdsByListId:error'];
});

// export const selectListsFetchStatus = (state: RootStateType): EntityLoadingStatusType =>
//   state.lists.loading;
