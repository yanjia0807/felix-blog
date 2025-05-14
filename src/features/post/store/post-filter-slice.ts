import { createSelector, createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

type PostFilterState = any;

const initialState: PostFilterState = {
  filters: {
    title: '',
    authorName: '',
    publishDateFrom: undefined,
    publishDateTo: undefined,
    tags: [],
  },
  keywords: '',
  debounceKeywords: '',
  searchFrom: 'keywords',
};

const postFilterSlice = createSlice({
  name: 'postFilter',
  initialState,
  reducers: {
    setFilters(state, action) {
      const filters = action.payload;
      state.keywords = '';
      state.filters = filters;
      state.searchFrom = 'filters';
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
    setKeywords(state, action) {
      const keywords = action.payload;
      state.keywords = keywords;
      state.filters = initialState.filters;
      state.searchFrom = 'keywords';
    },
    setDebounceKeywords(state, action) {
      const debounceKeywords = action.payload;
      state.debounceKeywords = debounceKeywords;
    },
  },
});

export const { setFilters, resetFilters, setKeywords, setDebounceKeywords } =
  postFilterSlice.actions;

export default postFilterSlice.reducer;

export const selectHasFilters = (state) => {
  const filters = state.postFilter.filters;
  return (
    (!_.isNil(filters.title) && _.trim(filters.title) !== '') ||
    (!_.isNil(filters.authorName) && _.trim(filters.authorName) !== '') ||
    !_.isNil(filters.publishDateFrom) ||
    !_.isNil(filters.publishDateTo) ||
    filters.tags.length > 0
  );
};

export const selectHasKeywords = (state) => {
  const debounceKeywords = state.postFilter.debounceKeywords;
  return !_.isNil(debounceKeywords) && _.trim(debounceKeywords) !== '';
};

export const selectHasCondition = (state) => selectHasFilters(state) || selectHasKeywords(state);

export const selectFilters = createSelector(
  (state) => state.postFilter,
  (postFilter) => {
    const { searchFrom, debounceKeywords, filters } = postFilter;
    return searchFrom === 'keywords'
      ? {
          title: debounceKeywords,
        }
      : {
          ...filters,
          tag: _.map(filters.tag || [], (item) => item.id),
        };
  },
);
