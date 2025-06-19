import { ListEmptyView } from '@/components/list-empty-view';
import PageSpinner from '@/components/page-spinner';
import { Divider } from '@/components/ui/divider';
import { FormControl } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import useToast from '@/hooks/use-toast';
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetSectionList,
} from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import _ from 'lodash';
import React, { memo, useCallback, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { useCreateComment } from '../api/use-create-comment';
import { useFetchPostCommentCount } from '../api/use-fetch-post-comment-count';
import { useFetchPostComments } from '../api/use-fetch-post-comments';
import {
  useCommentActions,
  useCommentPostDocumentId,
  useReplyComment,
  useSelectComment,
} from '../store';
import { CommentInput } from './comment-input';
import { CommentMenuSheet } from './comment-menu-sheet';
import { CommentSectionFooter } from './comment-section-footer';
import { CommentSectionHeader } from './comment-section-header';
import { useCommentSheetContext } from './comment-sheet-provider';
import { CommentSubSheet } from './comment-sub-sheet';

type CommentFormSchema = z.infer<typeof commentFormSchema>;

const commentFormSchema = z.object({
  content: z
    .string({
      required_error: '内容是必填项',
    })
    .min(1, '内容不能为空')
    .max(2000, '内容不能超过2000个字符'),
});

export const CommentSheet = memo(function CommentSheet() {
  const postDocumentId = useCommentPostDocumentId();
  const selectComment = useSelectComment();
  const replyComment = useReplyComment();
  const { setReplyComment, addExpandCommentDocumentId } = useCommentActions();
  const {
    commentSheetRef,
    commentMenuSheetRef,
    commentSubSheetRef,
    openMenu,
    closeMenu,
    openSub,
    closeSub,
    isExpanded,
    onMenuChange,
  } = useCommentSheetContext();
  const { user } = useAuth();
  const inputRef = useRef<any>(null);
  const snapPoints = useMemo(() => ['95%'], []);
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const { control, handleSubmit, reset } = useForm<CommentFormSchema>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: '',
    },
  });

  const commentsQuery = useFetchPostComments({
    postDocumentId,
    blockUsers: _.map(user?.blockUsers, (item) => item.documentId),
  });

  const commentCountQuery = useFetchPostCommentCount({
    postDocumentId,
    blockUsers: _.map(user?.blockUsers, (item) => item.documentId),
  });

  const createMutation = useCreateComment();

  const isPending = createMutation.isPending;

  const commentsData = _.map(
    _.flatMap(commentsQuery.data?.pages, (page: any) => page.data),
    (item) => ({
      ...item,
      title: item.content,
      data: [],
    }),
  );

  const commentCount = commentCountQuery.status === 'success' ? commentCountQuery.data : 0;

  const onSubmit = (formData: CommentFormSchema) => {
    const data = {
      content: formData.content,
      user: user?.documentId,
      post: postDocumentId,
      reply: replyComment?.documentId,
      topComment: replyComment?.topDocumentId,
    };
    createMutation.mutate(data, {
      onSuccess(data, variables, context) {
        toast.success({ description: '评论已发布' });

        if (data.topComment) {
          setReplyComment(undefined);
          addExpandCommentDocumentId(data.topComment.documentId);
        }

        reset({ content: '' });
      },
    });
  };

  const onSubmitEditing = () => {
    handleSubmit(onSubmit)();
  };

  const onEndReached = () => {
    if (commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
      commentsQuery.fetchNextPage();
    }
  };

  const renderSectionHeader = ({ section, index }: any) => {
    return (
      <CommentSectionHeader
        index={index}
        item={section}
        inputRef={inputRef}
        commentMenuSheetRef={commentMenuSheetRef}
        openMenu={openMenu}
      />
    );
  };

  const renderSectionFooter = ({ section }: any) => {
    return <CommentSectionFooter item={section} />;
  };

  const renderCommentItem = () => <></>;

  const renderEmptyComponent = () => <ListEmptyView text="暂无评论" />;

  const renderCommentInput = ({ field: { onChange, value } }: any) => {
    const placeholder = replyComment ? `回复 ${replyComment.username}` : '输入评论...';

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
  };

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
    if (isExpanded || !user) return null;

    return (
      <BottomSheetFooter {...props}>
        <HStack className="bg-background-100 p-2" style={{ paddingBottom: insets.bottom }}>
          <Controller name="content" control={control} render={renderCommentInput} />
        </HStack>
      </BottomSheetFooter>
    );
  };

  if (!postDocumentId) return null;

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
      {commentsQuery.isLoading && <PageSpinner />}
      <VStack className="flex-1 bg-background-100 px-4" space="md">
        <VStack className="mb-4 items-center">
          <Heading className="p-2">{`${commentCount}条评论`}</Heading>
          <Divider />
        </VStack>
        <BottomSheetSectionList
          contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
          sections={commentsData}
          keyExtractor={(item: any) => item.documentId}
          renderItem={renderCommentItem}
          renderSectionHeader={renderSectionHeader}
          renderSectionFooter={renderSectionFooter}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          onEndReached={onEndReached}
        />
        {selectComment && (
          <>
            <CommentMenuSheet
              menuRef={commentMenuSheetRef}
              close={closeMenu}
              openSub={openSub}
              onChange={onMenuChange}
            />
            <CommentSubSheet subRef={commentSubSheetRef} onChange={onMenuChange} close={closeSub} />
          </>
        )}
      </VStack>
    </BottomSheetModal>
  );
});
