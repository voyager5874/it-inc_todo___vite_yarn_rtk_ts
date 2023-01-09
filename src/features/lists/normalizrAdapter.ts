import { createEntityAdapter } from '@reduxjs/toolkit';

import type { ListEntityAppType } from 'features/lists/types';

export const listsAdapter = createEntityAdapter<ListEntityAppType>({
  sortComparer: (a, b) => b.order - a.order,
});
