import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

type CommentSheetState = any;

const initialState: CommentSheetState = {
  postDocumentId: undefined,
  expandedCommentDocumentIds: [],
  replyData: undefined,
};

const commentSheetSlice = createSlice({
  name: 'commentSheet',
  initialState,
  reducers: {
    setPostDocumentId(sliceState, action) {
      sliceState.postDocumentId = action.payload.postDocumentId;
    },
    replyComment(sliceState, action) {
      sliceState.replyData = action.payload;
    },
    expandComment(sliceState, action) {
      const { postDocumentId, commentDocumentId } = action.payload;

      const postItem = _.find(
        sliceState.expandedCommentDocumentIds,
        (item: any) => item.postDocumentId === postDocumentId,
      );

      if (postItem) {
        const commentItem = _.some(
          postItem.commentDocumenIds,
          (item: any) => item === commentDocumentId,
        );
        if (!commentItem) {
          postItem.commentDocumenIds.push(commentDocumentId);
        }
      } else {
        sliceState.expandedCommentDocumentIds.push({
          postDocumentId,
          commentDocumenIds: [commentDocumentId],
        });
      }
    },
    collapseComment(sliceState, action) {
      const { postDocumentId, commentDocumentId } = action.payload;
      const postItem = _.find(
        sliceState.expandedCommentDocumentIds,
        (item: any) => item.postDocumentId === postDocumentId,
      );

      if (postItem) {
        postItem.commentDocumenIds = _.filter(
          postItem.commentDocumenIds,
          (item: any) => item !== commentDocumentId,
        );
      }
    },
  },
});

export const { setPostDocumentId, expandComment, collapseComment, replyComment } =
  commentSheetSlice.actions;

export default commentSheetSlice.reducer;

export const selectPostDocumentId = (state) => state.commentSheet.postDocumentId;

export const selectReplyData = (state) => state.commentSheet.replyData;

export const selectIsCommentExpanded = (state, { postDocumentId, commentDocumentId }) => {
  const postItem = _.find(
    state.commentSheet.expandedCommentDocumentIds,
    (item: any) => item.postDocumentId === postDocumentId,
  );
  if (!postItem) return false;
  return _.some(postItem.commentDocumenIds, (item: string) => item === commentDocumentId);
};

export const selectExpandedCommentDocumentIds = (state, { postDocumentId }) => {
  const postItem = _.find(
    state.commentSheet.expandedCommentDocumentIds,
    (item: any) => item.postDocumentId === postDocumentId,
  );
  if (!postItem) return [];
  return postItem.commentDocumenIds;
};
