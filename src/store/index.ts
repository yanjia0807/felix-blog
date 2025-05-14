import { combineReducers, configureStore } from '@reduxjs/toolkit';
import commentSheetReducer from '@/features/comment/store/comment-sheet-slice';
import postFilterReducer from '@/features/post/store/post-filter-slice';

const rootReducer = combineReducers({
  postFilter: postFilterReducer,
  commentSheet: commentSheetReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export default store;
