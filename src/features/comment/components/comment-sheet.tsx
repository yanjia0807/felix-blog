import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetSectionList,
  BottomSheetFooter,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { InfiniteQueryObserver, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { Controller, useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shallowEqual } from 'react-redux';
import { z } from 'zod';
import { useAuth } from '@/features/auth/components/auth-provider';
import ListEmptyView from '@/components/list-empty-view';
import { Divider } from '@/components/ui/divider';
import { FormControl } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import useToast from '@/hooks/use-custom-toast';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { CommentInput } from './comment-input';
import { CommentItem } from './comment-item';
import { CommentSectionFooter } from './comment-section-footer';
import { CommentSectionHeader } from './comment-section-header';
import { useCommentSheetContext } from './comment-sheet-provider';
import {
  useFetchPostComments,
  useFetchPostCommentCount,
  useCreateComment,
  useDeleteComment,
  createRelatedCommentsQuery,
  queryRelatedComments,
} from '../api';
import {
  expandComment,
  replyComment,
  selectExpandedCommentDocumentIds,
  selectPostDocumentId,
  selectReplyData,
} from '../store';
import { Spinner } from '@/components/ui/spinner';
import PageSpinner from '@/components/page-spinner';

type CommentFormSchema = z.infer<typeof commentFormSchema>;

const commentFormSchema = z.object({
  content: z
    .string({
      required_error: '内容是必填项',
    })
    .min(1, '内容不能为空')
    .max(2000, '内容不能超过2000个字符'),
});

export const CommentSheet = memo(() => {
  useEffect(() => console.log('@render CommentSheet'));

  const postDocumentId = useAppSelector((state) => selectPostDocumentId(state));
  const replyData = useAppSelector((state) => selectReplyData(state));
  const expandedCommentDocumentIds = useAppSelector(
    (state) => selectExpandedCommentDocumentIds(state, { postDocumentId }),
    shallowEqual,
  );
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const inputRef = useRef<any>(null);
  const snapPoints = useMemo(() => ['95%'], []);
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<CommentFormSchema>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: '',
    },
  });

  const { commentSheetRef } = useCommentSheetContext();

  const commentQuery = useFetchPostComments({ postDocumentId });

  const commentCountQuery = useFetchPostCommentCount({ postDocumentId });

  const createMutation = useCreateComment({ postDocumentId });

  const deleteMutation = useDeleteComment({ postDocumentId });

  const isPending = createMutation.isPending || deleteMutation.isPending;

  const commentCount =
    commentCountQuery.status === 'success' ? commentCountQuery.data.comments.count : 0;

  const onSubmit = useCallback(
    (formData: CommentFormSchema) => {
      const data = {
        content: formData.content,
        user: user?.documentId,
        post: postDocumentId,
        reply: replyData?.documentId,
        topComment: replyData?.topDocumentId,
      };
      createMutation.mutate(data, {
        onSuccess(data, variables, context) {
          toast.success({ description: '评论已发布' });

          if (data.topComment) {
            dispatch(replyComment(undefined));
            dispatch(
              expandComment({ postDocumentId, commentDocumentId: data.topComment.documentId }),
            );
          }

          reset({ content: '' });
        },
      });
    },
    [createMutation, dispatch, postDocumentId, replyData, reset, toast, user?.documentId],
  );

  const renderSectionHeader = useCallback(({ section, index }: any) => {
    return <CommentSectionHeader index={index} item={section} inputRef={inputRef} />;
  }, []);

  const renderSectionFooter = useCallback(({ section }: any) => {
    return <CommentSectionFooter item={section} />;
  }, []);

  const renderCommentItem = useCallback(({ item }: any) => {
    return <CommentItem item={item} inputRef={inputRef} />;
  }, []);

  const renderEmptyComponent = () => <ListEmptyView text="暂无评论" />;

  const onSubmitEditing = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const renderCommentInput = useCallback(
    ({ field: { onChange, value } }: any) => {
      const placeholder = replyData ? `回复 ${replyData.username}` : '输入评论...';

      return (
        <FormControl className="flex-1" size="md">
          <CommentInput
            ref={inputRef}
            onChange={onChange}
            value={value}
            isPending={isPending}
            placeholder={placeholder}
            onSubmitEditing={onSubmitEditing}
          />
        </FormControl>
      );
    },
    [isPending, onSubmitEditing, replyData],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={'close'}
      />
    ),
    [],
  );

  const renderFooter = (props: any) => {
    return (
      <BottomSheetFooter {...props}>
        {user && (
          <HStack className="bg-background-100 p-2" style={{ paddingBottom: insets.bottom }}>
            <Controller name="content" control={control} render={renderCommentInput} />
          </HStack>
        )}
      </BottomSheetFooter>
    );
  };

  const onEndReached = () => {
    if (commentQuery.hasNextPage && !commentQuery.isFetchingNextPage) {
      commentQuery.fetchNextPage();
    }
  };

  useEffect(() => {
    queryRelatedComments({
      expandedCommentDocumentIds,
      postDocumentId,
      queryClient,
    }).then((result) => {
      const commentsData = _.map(
        _.flatMap(commentQuery.data?.pages, (page) => page.data),
        (item) => {
          const commentDocumentItem = _.find(
            result,
            (item1) => item1.commentDocumentId === item.documentId,
          );
          const data = commentDocumentItem ? commentDocumentItem.data : [];
          const title = item.content;
          return {
            ...item,
            title,
            data,
          };
        },
      );
      setComments(commentsData);
    });

    const observers = _.map(expandedCommentDocumentIds, (commentDocumentId) => {
      const observer = new InfiniteQueryObserver(
        queryClient,
        createRelatedCommentsQuery({ postDocumentId, commentDocumentId, enabled: true }),
      );

      const unsubscribe = observer.subscribe((result) => {
        if (result.status === 'success') {
          setComments((prev) =>
            _.map(prev, (item) =>
              item.documentId === commentDocumentId
                ? {
                    ...item,
                    data: _.flatMap(result.data.pages, (page) => page.data),
                  }
                : item,
            ),
          );
        }
      });

      return unsubscribe;
    });

    return () => {
      observers.forEach((unsubscribe) => unsubscribe());
    };
  }, [commentQuery.data, expandedCommentDocumentIds, postDocumentId, queryClient]);

  return (
    <BottomSheetModal
      ref={commentSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      keyboardBehavior="fillParent"
      keyboardBlurBehavior="restore"
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}>
      <VStack className="flex-1 bg-background-100 px-4" space="md">
        {commentQuery.isLoading && <PageSpinner />}
        <VStack className="mb-4 items-center">
          <Heading className="p-2">{`${commentCount}条评论`}</Heading>
          <Divider />
        </VStack>
        <BottomSheetSectionList
          contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
          sections={comments}
          keyExtractor={(item: any) => item.documentId}
          renderItem={renderCommentItem}
          renderSectionHeader={renderSectionHeader}
          renderSectionFooter={renderSectionFooter}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          onEndReached={onEndReached}
        />
      </VStack>
    </BottomSheetModal>
  );
});
