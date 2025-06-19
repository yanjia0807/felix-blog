import { useAuth } from '@/features/auth/components/auth-provider';
import _ from 'lodash';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';

interface State {
  selectedIndex: number;
  filterTags: number[];
}

interface Actions {
  setSelectedIndex: (selectedIndex: number) => void;
  selectTag: (tagId: number) => void;
}

const initialState: State = {
  selectedIndex: 0,
  filterTags: [],
};

export const usePostExploreStore = create<State & { actions: Actions }>()(
  immer((set) => ({
    ...initialState,
    actions: {
      setSelectedIndex: (selectedIndex) =>
        set((state) => {
          state.selectedIndex = selectedIndex;
        }),

      selectTag: (tagId) => {
        set((state) => {
          if (_.includes(state.filterTags, tagId)) {
            state.filterTags = _.filter(state.filterTags, (val: any) => val !== tagId);
          } else {
            state.filterTags = [...state.filterTags, tagId];
          }
        });
      },
    },
  })),
);

export const useSelectedIndex = () => usePostExploreStore((state) => state.selectedIndex);

export const useFilterTags = () => usePostExploreStore((state) => state.filterTags);

export const useFilters = ({ segments }) => {
  const { user } = useAuth();
  const { selectedIndex, filterTags } = usePostExploreStore(
    useShallow((state) => ({
      selectedIndex: state.selectedIndex,
      filterTags: state.filterTags,
    })),
  );

  const filterType = segments[selectedIndex].key;
  const followings = user ? _.map(user.followings, (item: any) => item.documentId) : [];
  const blockUsers = user ? _.map(user.blockUsers, (item: any) => item.documentId) : [];
  const filters = { filterType, tags: filterTags, blockUsers, followings };

  return filters;
};

export const usePostExploreActions = () => usePostExploreStore((state) => state.actions);
