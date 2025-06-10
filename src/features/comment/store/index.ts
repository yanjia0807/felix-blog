import _ from 'lodash';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface State {
  commentPostDocumentId: string | undefined;
  expandedCommentDocumentIds: any[];
  replyComment: any;
}

interface Actions {
  setCommentPostDocumentId: (postDocumentId: string) => void;
  setReplyComment: (replyComment: any) => void;
  addExpandCommentDocumentId: (commentDocumentId: string) => void;
  removeExpandCommentDocumentId: (commentDocumentId: string) => void;
}

const initialState: State = {
  commentPostDocumentId: undefined,
  expandedCommentDocumentIds: [],
  replyComment: undefined,
};

export const useCommentStore = create<State & { actions: Actions }>()(
  immer((set) => ({
    ...initialState,
    actions: {
      setCommentPostDocumentId: (postDocumentId) =>
        set((state) => {
          state.commentPostDocumentId = postDocumentId;
        }),

      setReplyComment: (replyComment) =>
        set((state) => {
          state.replyComment = replyComment;
        }),

      addExpandCommentDocumentId: (commentDocumentId) =>
        set((state) => {
          if (!_.includes(state.expandedCommentDocumentIds, commentDocumentId)) {
            state.expandedCommentDocumentIds.push(commentDocumentId);
          }
        }),

      removeExpandCommentDocumentId: (commentDocumentId) =>
        set((state) => {
          _.pull(state.expandedCommentDocumentIds, commentDocumentId);
        }),
    },
  })),
);

export const useCommentActions = () => useCommentStore((state) => state.actions);

export const useCommentPostDocumentId = () =>
  useCommentStore((state) => state.commentPostDocumentId);

export const useReplyComment = () => useCommentStore((state) => state.replyComment);

export const useIsCommentExpanded = (commentDocumentId) => {
  const expandedCommentDocumentIds = useCommentStore((state) => state.expandedCommentDocumentIds);

  return _.includes(expandedCommentDocumentIds, commentDocumentId);
};

export const useExpandedCommentDocumentIds = () =>
  useCommentStore((state) => state.expandedCommentDocumentIds);
