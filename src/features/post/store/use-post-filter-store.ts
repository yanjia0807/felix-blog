import _ from 'lodash';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';

interface Tag {
  id: string;
  name: string;
}

interface Filters {
  title: string;
  authorName: string;
  publishDateFrom?: Date;
  publishDateTo?: Date;
  tags: Tag[];
}

interface State {
  filters: Filters;
  debounceKeywords: string;
  searchFrom: 'keywords' | 'filters';
}

interface Actions {
  setFilters: (filters: State['filters']) => void;
  setDebounceKeywords: (debounceKeywords: string) => void;
}

const initialState: State = {
  filters: {
    title: '',
    authorName: '',
    publishDateFrom: undefined,
    publishDateTo: undefined,
    tags: [],
  },
  debounceKeywords: '',
  searchFrom: 'keywords',
};

export const usePostFilterStore = create<State & { actions: Actions }>()(
  immer((set) => ({
    ...initialState,
    actions: {
      setFilters: (filters) =>
        set((state) => {
          state.searchFrom = 'filters';
          state.filters = filters;
          state.debounceKeywords = initialState.debounceKeywords;
        }),

      setDebounceKeywords: (debounceKeywords) => {
        set((state) => {
          state.searchFrom = 'keywords';
          state.filters = initialState.filters;
          state.debounceKeywords = debounceKeywords;
        });
      },
    },
  })),
);

export const useFilters = () => usePostFilterStore((state) => state.filters);

export const useHasFilterConditions = () =>
  usePostFilterStore((state) => {
    const hasFilters =
      _.trim(state.filters.title) !== '' ||
      _.trim(state.filters.authorName) !== '' ||
      !_.isNil(state.filters.publishDateFrom) ||
      !_.isNil(state.filters.publishDateTo) ||
      state.filters.tags.length > 0;

    const hasKeywords = _.trim(state.debounceKeywords) !== '';

    return hasFilters || hasKeywords;
  });

export const useFilterConditions = () => {
  const { searchFrom, debounceKeywords, filters } = usePostFilterStore(
    useShallow((state) => ({
      searchFrom: state.searchFrom,
      debounceKeywords: state.debounceKeywords,
      filters: state.filters,
    })),
  );

  return searchFrom === 'keywords'
    ? {
        title: debounceKeywords,
      }
    : {
        ...filters,
        publishDateFrom: filters.publishDateFrom && new Date(filters.publishDateFrom),
        publishDateTo: filters.publishDateTo && new Date(filters.publishDateTo),
        tags: _.map(filters.tags || [], (item) => item.id),
      };
};

export const usePostFilterActions = () => usePostFilterStore((state) => state.actions);
