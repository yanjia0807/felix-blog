import React, {
  createContext,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetSectionList,
  BottomSheetTextInput,
  BottomSheetFooter,
  BottomSheetModal,
  useBottomSheetInternal,
} from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import _ from 'lodash';
import { MessageCircle } from 'lucide-react-native';
import { Heart, HeartCrack } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputFocusEventData,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import {
  createComment,
  deleteComment,
  fetchPostComments,
  fetchRelatedComments,
} from '@/api/comment';
import { formatDistance } from '@/utils/date';
import { imageFormat } from '@/utils/file';
import { useAuth } from './auth-provider';
import PageSpinner from './page-spinner';
import { Avatar, AvatarFallbackText, AvatarImage } from './ui/avatar';
import { Box } from './ui/box';
import { Button, ButtonIcon, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { FormControl } from './ui/form-control';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Input, InputField } from './ui/input';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';
import useCustomToast from './use-custom-toast';

type CommentContextType =
  | {
      postDocumentId: string;
      setPostDocumentId: React.Dispatch<any>;
      commentCount: number;
      setCommentCount: React.Dispatch<any>;
      commentSheetRef: React.RefObject<BottomSheetModal>;
      open: () => void;
      close: () => void;
    }
  | undefined;

type CommentFormSchema = z.infer<typeof commentFormSchema>;

const commentFormSchema = z.object({
  content: z
    .string({
      required_error: '内容是必填项',
    })
    .min(1, '内容不能为空')
    .max(2000, '内容不能超过2000个字符'),
});

const CommentContext = createContext<CommentContextType>(undefined);

export const CommentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [postDocumentId, setPostDocumentId] = useState<any>();
  const [commentCount, setCommentCount] = useState<any>();
  const commentSheetRef = useRef<BottomSheetModal>(null);

  const open = useCallback(() => commentSheetRef.current?.present(), []);
  const close = useCallback(() => commentSheetRef.current?.close(), []);

  const value = useMemo(
    () => ({
      postDocumentId,
      setPostDocumentId,
      commentCount,
      setCommentCount,
      commentSheetRef,
      open,
      close,
    }),
    [postDocumentId, commentCount, open, close],
  );

  return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;
};

export const useCommentContext = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error('useCommentContext must be used within a CommentProvider');
  }
  return context;
};

export const CommentIcon: React.FC<any> = ({ post }) => {
  useEffect(() => console.log('@render CommentIcon'));
  const { open, setPostDocumentId, setCommentCount } = useCommentContext();
  const onInputIconPress = () => {
    setPostDocumentId(post.documentId);
    setCommentCount(post.comments.count);
    open();
  };

  return (
    <Button variant="link" action="secondary" onPress={() => onInputIconPress()}>
      <HStack space="xs" className="items-center">
        <ButtonIcon as={MessageCircle} />
        <ButtonText size="sm">评论{`(${post.comments.count})`}</ButtonText>
      </HStack>
    </Button>
  );
};

export const CommentSectionHeader: React.FC<any> = memo(
  ({
    index,
    section,
    expandDocumentIds,
    onReplyButtonPress,
    onDeleteButtonPress,
    onExpandButtonPress,
  }) => {
    useEffect(() => console.log('@render CommentSectionHeader'));

    const { user } = useAuth();
    return (
      <HStack className={`my-2 ${index === 0 ? 'mt-0' : ''}`}>
        <Box className="w-12">
          <Avatar size="sm">
            <AvatarFallbackText>{section.user.username}</AvatarFallbackText>
            <AvatarImage
              source={{
                uri: imageFormat(section.user.avatar, 's', 't')?.fullUrl,
              }}
            />
          </Avatar>
        </Box>
        <VStack className="flex-1" space="xs">
          <Text size="sm">{section.user.username}</Text>
          <Text size="md">{section.content}</Text>
          <HStack className="items-center justify-between">
            <HStack className="items-center" space="md">
              <Text size="sm">{formatDistance(section.createdAt)}</Text>
              {user && (
                <Button
                  size="sm"
                  variant="link"
                  onPress={() =>
                    onReplyButtonPress(
                      section.documentId,
                      section.documentId,
                      section.user.username,
                    )
                  }>
                  <ButtonText>回复</ButtonText>
                </Button>
              )}

              {user && section.user.documentId === user.documentId && (
                <Button
                  size="sm"
                  action="secondary"
                  variant="link"
                  onPress={() => onDeleteButtonPress(section.documentId, null)}>
                  <ButtonText>删除</ButtonText>
                </Button>
              )}
            </HStack>
            <HStack className="flex-1 items-center justify-end" space="md">
              <TouchableOpacity>
                <HStack className="items-center" space="sm">
                  <Icon as={Heart} size="sm" />
                  <Text size="xs">{section.likes}</Text>
                </HStack>
              </TouchableOpacity>
              <TouchableOpacity>
                <HStack className="items-center" space="sm">
                  <Icon as={HeartCrack} size="sm" />
                  <Text size="xs">{section.unlikes}</Text>
                </HStack>
              </TouchableOpacity>
            </HStack>
          </HStack>
          {section.relatedComments?.count > 0 &&
            !_.includes(expandDocumentIds, section.documentId) && (
              <HStack>
                <Button
                  size="sm"
                  variant="link"
                  action="secondary"
                  onPress={() => onExpandButtonPress(section.documentId)}>
                  <ButtonText>展开回复</ButtonText>
                </Button>
              </HStack>
            )}
        </VStack>
      </HStack>
    );
  },
  (prev, next) => {
    return (
      _.isEqual(prev.section.id, next.section.id) &&
      _.isEqual(prev.expandDocumentIds, next.expandDocumentIds)
    );
  },
);

export const CommentSectionFooter: React.FC<any> = memo(
  ({ section, expandDocumentIds, hasNextPage, onExpandMoreButtonPress, onCollapseButtonPress }) => {
    useEffect(() => console.log('@render CommentSectionFooter'));

    return (
      <HStack className="items-center pl-12">
        <HStack className="items-center" space="md">
          {hasNextPage && (
            <Button
              size="sm"
              variant="link"
              action="secondary"
              onPress={() => onExpandMoreButtonPress(section.documentId)}>
              <ButtonText>展开更多</ButtonText>
            </Button>
          )}
          {section.relatedComments?.count > 0 &&
            _.includes(expandDocumentIds, section.documentId) && (
              <Button
                size="sm"
                variant="link"
                action="secondary"
                onPress={() => onCollapseButtonPress(section)}>
                <ButtonText>收起</ButtonText>
              </Button>
            )}
        </HStack>
      </HStack>
    );
  },
);

export const CommentItem: React.FC<any> = memo(
  ({ item, onReplyButtonPress, onDeleteButtonPress }) => {
    useEffect(() => console.log('@render CommentItem'));

    const { user } = useAuth();
    return (
      <HStack className={`my-2 items-start pl-12`}>
        <HStack space="sm">
          <Avatar size="xs">
            <AvatarFallbackText>{item.user.username}</AvatarFallbackText>
            <AvatarImage source={{ uri: imageFormat(item.user.avatar, 's', 't')?.fullUrl }} />
          </Avatar>
          <VStack className="flex-1">
            <HStack className="items-center" space="sm">
              <Text size="sm">{item.user.username}</Text>
              {item.reply && (
                <>
                  <Text>→</Text>
                  <Text size="sm">{item.reply.user.username}</Text>
                </>
              )}
            </HStack>
            <Text size="md">{item.content}</Text>
            <HStack className="items-center justify-between">
              <HStack className="items-center" space="md">
                <Text size="sm">{format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}</Text>
                {user && (
                  <Button
                    size="sm"
                    variant="link"
                    onPress={() =>
                      onReplyButtonPress(
                        item.documentId,
                        item.topComment.documentId,
                        item.user.username,
                      )
                    }>
                    <ButtonText>回复</ButtonText>
                  </Button>
                )}

                {user && item.user.documentId === user.documentId && (
                  <Button
                    size="sm"
                    variant="link"
                    action="secondary"
                    onPress={() =>
                      onDeleteButtonPress(item.documentId, item.topComment.documentId)
                    }>
                    <ButtonText>删除</ButtonText>
                  </Button>
                )}
              </HStack>
              <HStack className="flex-1 items-center justify-end" space="md">
                <TouchableOpacity>
                  <HStack className="items-center" space="sm">
                    <Icon as={Heart} size="sm" />
                    <Text size="xs">{item.likes}</Text>
                  </HStack>
                </TouchableOpacity>
                <TouchableOpacity>
                  <HStack className="items-center" space="sm">
                    <Icon as={HeartCrack} size="sm" />
                    <Text size="xs">{item.unlikes}</Text>
                  </HStack>
                </TouchableOpacity>
              </HStack>
            </HStack>
          </VStack>
        </HStack>
      </HStack>
    );
  },
);

export const CommentInput: React.FC<any> = memo(
  forwardRef<any, any>(
    ({ onFocus, onBlur, onChange, value, isPending, placeholder, onSubmitEditing }, ref) => {
      console.log('@render CommentInput');
      const { shouldHandleKeyboardEvents } = useBottomSheetInternal();

      const handleOnFocus = useCallback(
        (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
          shouldHandleKeyboardEvents.value = true;
          if (onFocus) {
            onFocus(args);
          }
        },
        [onFocus, shouldHandleKeyboardEvents],
      );

      const handleOnBlur = useCallback(
        (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
          shouldHandleKeyboardEvents.value = false;
          if (onBlur) {
            onBlur(args);
          }
        },
        [onBlur, shouldHandleKeyboardEvents],
      );

      useEffect(() => {
        return () => {
          shouldHandleKeyboardEvents.value = false;
        };
      }, [shouldHandleKeyboardEvents]);

      return (
        <Input variant="rounded" isDisabled={isPending}>
          <InputField
            ref={ref}
            inputMode="text"
            autoCapitalize="none"
            returnKeyType="send"
            placeholder={placeholder}
            value={value}
            onBlur={handleOnBlur}
            onFocus={handleOnFocus}
            onChangeText={onChange}
            onSubmitEditing={onSubmitEditing}
          />
        </Input>
      );
    },
  ),
);

export const CommentSheet = memo(() => {
  useEffect(() => console.log('@render CommentSheet'));

  const { user } = useAuth();
  const inputRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const snapPoints = useMemo(() => ['95%'], []);
  const insets = useSafeAreaInsets();
  const toast = useCustomToast();
  const [replyDocument, setReplyDocument] = useState<any>();
  const [currentDocumentId, setCurrentDocumentId] = useState<any>();
  const [expandDocumentIds, setExpandDocumentIds] = useState<any>([]);

  const { control, handleSubmit, reset } = useForm<CommentFormSchema>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: '',
    },
  });

  const { postDocumentId, commentCount, commentSheetRef } = useCommentContext();

  const commentQuery = useInfiniteQuery<any>({
    queryKey: ['comments', 'list', postDocumentId],
    queryFn: ({ pageParam }) => fetchPostComments(pageParam),
    enabled: !!postDocumentId,
    initialPageParam: {
      postDocumentId,
      pagination: {
        page: 1,
        pageSize: 20,
      },
    },
    getNextPageParam: (lastPage: any) => {
      const {
        meta: {
          pagination: { page, pageSize, pageCount },
        },
      } = lastPage;

      if (page < pageCount) {
        return {
          pagination: { page: page + 1, pageSize },
        };
      }

      return null;
    },
  });

  const relatedCommentQuery = useInfiniteQuery<any>({
    queryKey: ['comments', 'list', postDocumentId, currentDocumentId],
    enabled: !!postDocumentId && !!currentDocumentId,
    queryFn: ({ pageParam }) => fetchRelatedComments(pageParam),
    initialPageParam: {
      topDocumentId: currentDocumentId,
      pagination: {
        page: 1,
        pageSize: 10,
      },
    },
    getNextPageParam: (lastPage: any) => {
      const {
        meta: {
          pagination: { page, pageSize, pageCount },
        },
      } = lastPage;

      if (page < pageCount) {
        return {
          topDocumentId: currentDocumentId,
          pagination: { page: page + 1, pageSize },
        };
      }

      return null;
    },
  });

  const createMutation = useMutation({
    mutationFn: (comment: any) => createComment(comment),
    async onSuccess(data: any) {
      toast.success({ description: '评论已发布' });

      await queryClient.invalidateQueries({
        queryKey: ['comments', 'list', postDocumentId],
      });

      await queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', postDocumentId],
      });

      await queryClient.invalidateQueries({
        queryKey: ['posts', 'list'],
      });

      if (data.topComment) {
        setExpandDocumentIds((prev: any) => _.uniq([...prev, data.topComment.documentId]));
        setReplyDocument(null);
      }

      reset({ content: '' });
    },
    onError(error: any) {
      toast.error({ description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ documentId }: any) => deleteComment(documentId),
    onSuccess: async (data, variables) => {
      toast.success({ description: '评论已删除' });

      await queryClient.invalidateQueries({
        queryKey: ['comments', 'list', postDocumentId],
      });

      await queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', postDocumentId],
      });

      await queryClient.invalidateQueries({
        queryKey: ['posts', 'list'],
      });
    },
    onError(error: any) {
      toast.error({ description: error.message });
    },
  });

  const isLoading = commentQuery.isLoading || relatedCommentQuery.isLoading;

  const isPending = createMutation.isPending || deleteMutation.isPending;

  const comments = useMemo(() => {
    console.log('comments');
    if (!commentQuery.data) return [];

    const commentsData = _.reduce(
      commentQuery.data?.pages,
      (result: any, page: any) => [...result, ...page.data],
      [],
    );

    return _.map(commentsData, (item: any) => {
      let relatedComments = [];

      const relatedCommentData: any = queryClient.getQueryData([
        'comments',
        'list',
        postDocumentId,
        item.documentId,
      ]);

      if (relatedCommentData) {
        relatedComments = _.reduce(
          relatedCommentData.pages,
          (result: any, page: any) => [...result, ...page.data],
          [],
        );
      }

      return {
        ...item,
        title: item.content,
        data: relatedComments,
      };
    });
  }, [postDocumentId, commentQuery.data, relatedCommentQuery.data]);

  const onExpandButtonPress = useCallback(async (currentDocumentId: any) => {
    setCurrentDocumentId(currentDocumentId);
    setExpandDocumentIds((prev: any) => _.uniq([...prev, currentDocumentId]));
  }, []);

  const onExpandMoreButtonPress = useCallback(
    async (currentDocumentId: any) => {
      setCurrentDocumentId(currentDocumentId);
      if (relatedCommentQuery.hasNextPage && !relatedCommentQuery.isFetchingNextPage) {
        relatedCommentQuery.fetchNextPage();
      }
    },
    [relatedCommentQuery],
  );

  const onCollapseButtonPress = useCallback(async (section: any) => {
    setExpandDocumentIds((prev: any) =>
      _.filter(prev, (documentId: string) => documentId !== section.documentId),
    );
  }, []);

  const onSubmit = useCallback(
    (formData: CommentFormSchema) => {
      const data = {
        content: formData.content,
        user: user?.documentId,
        post: postDocumentId,
        reply: replyDocument?.documentId,
        topComment: replyDocument?.topDocumentId,
      };
      if (replyDocument?.topDocumentId) {
        setCurrentDocumentId(replyDocument?.topDocumentId);
      }
      createMutation.mutate(data);
    },
    [
      createMutation,
      postDocumentId,
      replyDocument?.documentId,
      replyDocument?.topDocumentId,
      user?.documentId,
    ],
  );

  const onDeleteButtonPress = useCallback(
    (documentId: string, topDocumentId: string | null) => {
      if (topDocumentId) {
        setCurrentDocumentId(topDocumentId);
      }

      deleteMutation.mutate({
        documentId,
        topDocumentId,
      });
    },
    [deleteMutation],
  );

  const onReplyButtonPress = useCallback(
    (replyDocumentId: string, replyTopDocumentId: string, username: string) => {
      setReplyDocument({
        documentId: replyDocumentId,
        topDocumentId: replyTopDocumentId,
        username: username,
      });

      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    },
    [],
  );

  const renderSectionHeader = useCallback(
    ({ section, index }: any) => {
      return (
        <CommentSectionHeader
          index={index}
          section={section}
          expandDocumentIds={expandDocumentIds}
          onDeleteButtonPress={onDeleteButtonPress}
          onExpandButtonPress={onExpandButtonPress}
          onReplyButtonPress={onReplyButtonPress}
        />
      );
    },
    [expandDocumentIds, onDeleteButtonPress, onExpandButtonPress, onReplyButtonPress],
  );

  const renderSectionFooter = useCallback(
    ({ section }: any) => (
      <CommentSectionFooter
        section={section}
        expandDocumentIds={expandDocumentIds}
        onExpandMoreButtonPress={onExpandMoreButtonPress}
        onCollapseButtonPress={onCollapseButtonPress}
        hasNextPage={relatedCommentQuery.hasNextPage}
      />
    ),
    [
      expandDocumentIds,
      onExpandMoreButtonPress,
      onCollapseButtonPress,
      relatedCommentQuery.hasNextPage,
    ],
  );

  const renderCommentItem = ({ item }: any) => {
    return _.includes(expandDocumentIds, item.topComment.documentId) ? (
      <CommentItem
        item={item}
        onDeleteButtonPress={onDeleteButtonPress}
        onReplyButtonPress={onReplyButtonPress}
      />
    ) : (
      <></>
    );
  };

  const renderEmptyComponent = useCallback(() => {
    return (
      <Box className="mt-10 w-full items-center justify-center">
        <Text size="sm">暂无评论</Text>
      </Box>
    );
  }, []);

  const renderCommentInput = useCallback(
    ({ field: { onChange, value } }: any) => {
      const placeholder = replyDocument ? `回复 ${replyDocument.username}` : '输入评论...';

      const onSubmitEditing = () => {
        handleSubmit(onSubmit)();
        setReplyDocument(null);
        reset();
      };

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
    [isPending, inputRef, replyDocument, reset, handleSubmit, onSubmit],
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

  const renderFooter = useCallback(
    (props: any) => {
      return (
        <BottomSheetFooter {...props}>
          {user && (
            <HStack className="bg-background-100 p-2" style={{ paddingBottom: insets.bottom }}>
              <Controller name="content" control={control} render={renderCommentInput} />
            </HStack>
          )}
        </BottomSheetFooter>
      );
    },
    [control, insets.bottom, renderCommentInput, user],
  );

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
      <PageSpinner isVisiable={isLoading} />
      <VStack className="flex-1 bg-background-100 px-4" space="md">
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
          onEndReached={() => {
            if (commentQuery.hasNextPage && !commentQuery.isFetchingNextPage) {
              commentQuery.fetchNextPage();
            }
          }}
        />
      </VStack>
    </BottomSheetModal>
  );
});
