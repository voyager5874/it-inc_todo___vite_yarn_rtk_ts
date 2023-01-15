import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatchType, RootStateType } from 'app/types';

// export const useAppDispatch: () => AppDispatchType = useDispatch;
export const useAppDispatch = useDispatch<AppDispatchType>;
export const useAppSelector: TypedUseSelectorHook<RootStateType> = useSelector;
