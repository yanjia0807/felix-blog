import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetSectionList,
  BottomSheetTextInput,
  BottomSheetFooter,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import _ from 'lodash';
import { MessageCircle } from 'lucide-react-native';
import { Heart, HeartCrack } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { apiServerURL } from '@/api';
import {
  createComment,
  deleteComment,
  fetchPostComments,
  fetchRelatedComments,
} from '@/api/comment';
import { formatDistance } from '@/utils/date';
import { useAuth } from './auth-context';
import PageSpinner from './page-spinner';
import { Avatar, AvatarFallbackText, AvatarImage } from './ui/avatar';
import { Box } from './ui/box';
import { Button, ButtonIcon, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { FormControl } from './ui/form-control';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Input } from './ui/input';
import { Pressable } from './ui/pressable';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';
import useCustomToast from './use-custom-toast';

const CommentContext = createContext<any>({});

export const CommentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [commentPost, setCommentPost] = useState<any>();
  const changeCommentPost = useCallback((post: any) => setCommentPost(post), []);
  const commentSheetRef = useRef<BottomSheetModal>(null);

  const value = useMemo(
    () => ({
      commentPost,
      changeCommentPost,
      commentSheetRef,
    }),
    [changeCommentPost, commentPost],
  );

  return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;
};

export const useCommentContext = () => useContext<any>(CommentContext);

type CommentFormSchema = z.infer<typeof commentFormSchema>;

const commentFormSchema = z.object({
  content: z
    .string({
      required_error: '内容是必填项',
    })
    .min(1, '内容不能为空')
    .max(2000, '内容不能超过2000个字符'),
});

export const CommentIcon = ({ item }: any) => {
  const { commentSheetRef, changeCommentPost } = useCommentContext();

  const onInputIconPress = () => {
    changeCommentPost(item);
    commentSheetRef.current?.present();
  };

  return (
    <Button variant="link" action="secondary" onPress={() => onInputIconPress()}>
      <HStack space="xs" className="items-center">
        <ButtonIcon as={MessageCircle} />
        <ButtonText size="sm">评论{`(${item.comments.count})`}</ButtonText>
      </HStack>
    </Button>
  );
};

export const CommentSheet = () => {
  const { user } = useAuth();
  const inputRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const snapPoints = useMemo(() => ['90%'], []);
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

  const { commentPost, commentSheetRef } = useCommentContext();
  const postDocumentId = commentPost?.documentId;

  const commentQuery = useInfiniteQuery<any>({
    queryKey: ['posts', 'detail', postDocumentId, 'comments'],
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
    queryKey: ['posts', 'detail', postDocumentId, 'comments', currentDocumentId],
    enabled: !!currentDocumentId,
    queryFn: ({ pageParam }) => fetchRelatedComments(pageParam),
    initialPageParam: {
      topDocumentId: currentDocumentId,
      pagination: {
        page: 1,
        pageSize: 5,
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
  });

  const deleteMutation = useMutation({
    mutationFn: ({ documentId }: any) => deleteComment(documentId),
  });

  const isLoading = commentQuery.isLoading || relatedCommentQuery.isLoading;

  const isPending = createMutation.isPending || deleteMutation.isPending;

  const commentsData = _.reduce(
    commentQuery.data?.pages,
    (result: any, page: any) => [...result, ...page.data],
    [],
  );

  const comments = _.map(commentsData, (item: any) => {
    const relatedCommentData: any = queryClient.getQueryData([
      'posts',
      'detail',
      postDocumentId,
      'comments',
      item.documentId,
    ]);

    const relatedComments = _.reduce(
      relatedCommentData?.pages,
      (result: any, page: any) => [...result, ...page.data],
      [],
    );

    return {
      ...item,
      title: item.content,
      data: relatedComments,
    };
  });

  const onExpandButtonPress = async (currentDocumentId: any) => {
    if (
      !queryClient.getQueryData(['posts', 'detail', postDocumentId, 'comments', currentDocumentId])
    ) {
      setCurrentDocumentId(currentDocumentId);
    }
    setExpandDocumentIds((prev: any) => _.uniq([...prev, currentDocumentId]));
  };

  const onExpandMoreButtonPress = async (currentDocumentId: any) => {
    setCurrentDocumentId(currentDocumentId);
    if (relatedCommentQuery.hasNextPage && !relatedCommentQuery.isFetchingNextPage) {
      relatedCommentQuery.fetchNextPage();
    }
  };

  const onCollapseButtonPress = async (section: any) => {
    setExpandDocumentIds((prev: any) =>
      _.filter(prev, (documentId: string) => documentId !== section.documentId),
    );
  };

  const onSubmit = (formData: CommentFormSchema) => {
    const data = {
      content: formData.content,
      user: user.documentId,
      post: postDocumentId,
      reply: replyDocument?.documentId,
      topComment: replyDocument?.topDocumentId,
    };
    setCurrentDocumentId(null);

    createMutation.mutate(data, {
      async onSuccess(data: any) {
        toast.success({ description: '评论已发布' });

        if (data.topComment) {
          setCurrentDocumentId(data.topComment.documentId);
          await queryClient.invalidateQueries({
            queryKey: ['posts', 'detail', postDocumentId, 'comments', data.topComment.documentId],
            exact: true,
          });
          setExpandDocumentIds((prev: any) => _.uniq([...prev, data.topComment.documentId]));
          setReplyDocument(null);
        }

        await queryClient.invalidateQueries({
          queryKey: ['posts', 'detail', postDocumentId, 'comments'],
          exact: true,
        });

        queryClient.invalidateQueries({
          queryKey: ['posts', 'detail', postDocumentId],
          exact: true,
        });

        await queryClient.setQueriesData({ queryKey: ['posts', 'list'] }, (oldData: any) => ({
          pages: _.map(oldData.pages, (page: any) => ({
            meta: page.meta,
            data: _.map(page.data, (item: any) =>
              item.documentId === postDocumentId
                ? {
                    ...item,
                    comments: {
                      count: item.comments.count + 1,
                    },
                  }
                : {
                    ...item,
                  },
            ),
          })),
          pageParams: oldData.pageParams,
        }));

        reset({ content: '' });
      },
      onError(error: any) {
        toast.error({ description: error.message });
      },
    });
  };

  const onDeleteButtonPress = (documentId: string, topDocumentId: string | null) => {
    setCurrentDocumentId(null);
    deleteMutation.mutate(
      {
        documentId,
        topDocumentId,
      },
      {
        onSuccess: async () => {
          toast.success({ description: '评论已删除' });
          if (topDocumentId) {
            setCurrentDocumentId(topDocumentId);
            await queryClient.invalidateQueries({
              queryKey: ['posts', 'detail', postDocumentId, 'comments', topDocumentId],
              exact: true,
            });
          }
          queryClient.invalidateQueries({
            queryKey: ['posts', 'detail', postDocumentId, 'comments'],
            exact: true,
          });
          queryClient.invalidateQueries({
            queryKey: ['posts', 'detail', postDocumentId],
            exact: true,
          });
          await queryClient.setQueriesData({ queryKey: ['posts', 'list'] }, (oldData: any) => ({
            pages: _.map(oldData.pages, (page: any) => ({
              meta: page.meta,
              data: _.map(page.data, (item: any) =>
                item.documentId === postDocumentId
                  ? {
                      ...item,
                      comments: {
                        count: item.comments.count - 1,
                      },
                    }
                  : {
                      ...item,
                    },
              ),
            })),
            pageParams: oldData.pageParams,
          }));
        },
        onError(error: any) {
          toast.error({ description: error.message });
        },
      },
    );
  };

  const onReplyButtonPress = (
    replyDocumentId: string,
    replyTopDocumentId: string,
    username: string,
  ) => {
    setReplyDocument({
      documentId: replyDocumentId,
      topDocumentId: replyTopDocumentId,
      username: username,
    });

    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  const renderSectionHeader = ({ section, index }: any) => {
    return (
      <HStack className={`my-2 ${index === 0 ? 'mt-0' : ''}`}>
        <Box className="w-12">
          <Avatar size="sm">
            <AvatarFallbackText>{section.user.username}</AvatarFallbackText>
            <AvatarImage
              source={{
                uri: `${apiServerURL}${section.user.avatar?.formats.thumbnail.url}`,
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
              <Pressable>
                <HStack className="items-center" space="sm">
                  <Icon as={Heart} size="sm" />
                  <Text size="xs">{section.likes}</Text>
                </HStack>
              </Pressable>
              <Pressable>
                <HStack className="items-center" space="sm">
                  <Icon as={HeartCrack} size="sm" />
                  <Text size="xs">{section.unlikes}</Text>
                </HStack>
              </Pressable>
            </HStack>
          </HStack>
          {section.relatedComments.count > 0 &&
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
  };

  const renderSectionFooter = ({ section }: any) => {
    return (
      <HStack className="items-center pl-12">
        <HStack className="items-center" space="md">
          {relatedCommentQuery.hasNextPage && (
            <Button
              size="sm"
              variant="link"
              action="secondary"
              onPress={() => onExpandMoreButtonPress(section.documentId)}>
              <ButtonText>展开更多</ButtonText>
            </Button>
          )}
          {section.relatedComments.count > 0 &&
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
  };

  const renderCommentItem = ({ item, index }: any) => {
    return _.includes(expandDocumentIds, item.topComment.documentId) ? (
      <HStack className={`my-2 items-start pl-12`}>
        <HStack space="sm">
          <Avatar size="xs">
            <AvatarFallbackText>{item.user.username}</AvatarFallbackText>
            <AvatarImage
              source={{ uri: `${apiServerURL}${item.user.avatar?.formats.thumbnail.url}` }}
            />
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
                <Pressable>
                  <HStack className="items-center" space="sm">
                    <Icon as={Heart} size="sm" />
                    <Text size="xs">{item.likes}</Text>
                  </HStack>
                </Pressable>
                <Pressable>
                  <HStack className="items-center" space="sm">
                    <Icon as={HeartCrack} size="sm" />
                    <Text size="xs">{item.unlikes}</Text>
                  </HStack>
                </Pressable>
              </HStack>
            </HStack>
          </VStack>
        </HStack>
      </HStack>
    ) : (
      <></>
    );
  };

  const renderEmptyComponent = () => {
    return (
      <Box className="mt-10 w-full items-center justify-center">
        <Text size="sm">暂无评论</Text>
      </Box>
    );
  };

  const renderCommentInput = ({ field: { onChange, onBlur, value } }: any) => {
    const handleBlur = () => {
      onBlur();
      setReplyDocument(null);
      reset();
    };

    return (
      <FormControl className="flex-1" size="md">
        <Input className="flex-1 bg-background-50" variant="rounded" isDisabled={isPending}>
          <BottomSheetTextInput
            ref={inputRef}
            inputMode="text"
            autoCapitalize="none"
            className="h-full flex-1 px-3"
            returnKeyType="send"
            placeholder={replyDocument ? `回复 ${replyDocument.username}` : '输入评论...'}
            value={value}
            onBlur={handleBlur}
            onChangeText={onChange}
            onSubmitEditing={handleSubmit(onSubmit)}
          />
        </Input>
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

  return (
    <BottomSheetModal
      ref={commentSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}>
      <VStack className="flex-1 bg-background-100 p-4" space="md">
        <PageSpinner isVisiable={isLoading} />
        <VStack className="mb-4 items-center">
          <Heading className="p-2">{`${commentPost?.comments.count}条评论`}</Heading>
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
};
