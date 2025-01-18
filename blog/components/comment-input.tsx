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
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
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
import { useAuth } from './auth-context';
import { Avatar, AvatarFallbackText, AvatarImage } from './ui/avatar';
import { Box } from './ui/box';
import { Button, ButtonText } from './ui/button';
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
  const [postDocumentId, setPostDocumentId] = useState<any>();
  const [replyDocumentId, setReplyDocumentId] = useState<any>();
  const [replyTopDocumentId, setReplyTopDocumentId] = useState<any>();
  const [replyUsername, setReplyUsername] = useState<any>();
  const [expandDocumentId, setExpandDocumentId] = useState<any>();
  const [expandDocumentIds, setExpandDocumentIds] = useState<any>([]);
  const [commentCount, setCommentCount] = useState(0);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

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
    queryKey: ['posts', 'detail', postDocumentId, 'comments', expandDocumentId],
    enabled: !!expandDocumentId,
    queryFn: ({ pageParam }) => fetchRelatedComments(pageParam),
    initialPageParam: {
      topDocumentId: expandDocumentId,
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
          topDocumentId: expandDocumentId,
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

  const value = {
    postDocumentId,
    setPostDocumentId,
    expandDocumentId,
    setExpandDocumentId,
    replyDocumentId,
    setReplyDocumentId,
    replyTopDocumentId,
    setReplyTopDocumentId,
    replyUsername,
    setReplyUsername,
    expandDocumentIds,
    setExpandDocumentIds,
    commentCount,
    setCommentCount,
    commentQuery,
    relatedCommentQuery,
    createMutation,
    deleteMutation,
    bottomSheetRef,
  };

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

export const CommentListInput = ({ onPress, commentCount }: any) => {
  const { bottomSheetRef } = useCommentContext();

  const onInputIconPress = () => {
    onPress();
    bottomSheetRef.current?.present();
  };

  return (
    <Pressable onPress={() => onInputIconPress()}>
      <HStack space="xs" className="items-center">
        <Icon as={MessageCircle} />
        <Text size="xs">{commentCount}</Text>
      </HStack>
    </Pressable>
  );
};

export const CommentInput = () => {
  const { bottomSheetRef, commentCount } = useCommentContext();
  const onInputIconPress = () => bottomSheetRef.current?.present();

  return (
    <Pressable onPress={() => onInputIconPress()}>
      <HStack space="xs" className="items-center">
        <Icon as={MessageCircle} />
        <Text size="xs">{commentCount}</Text>
      </HStack>
    </Pressable>
  );
};

export const CommentSheet = () => {
  const { user } = useAuth();

  const inputRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const snapPoints = useMemo(() => ['60%', '90%'], []);
  const insets = useSafeAreaInsets();
  const toast = useCustomToast();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<CommentFormSchema>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: '',
    },
  });

  const {
    postDocumentId,
    setExpandDocumentId,
    replyTopDocumentId,
    setReplyTopDocumentId,
    replyDocumentId,
    setReplyDocumentId,
    replyUsername,
    setReplyUsername,
    expandDocumentIds,
    setExpandDocumentIds,
    commentCount,
    commentQuery,
    relatedCommentQuery,
    createMutation,
    deleteMutation,
    bottomSheetRef,
  } = useCommentContext();

  const comments = useMemo(() => {
    const commentsData = _.reduce(
      commentQuery.data?.pages,
      (result: any, page: any) => [...result, ...page.data],
      [],
    );

    return _.map(commentsData, (item: any) => {
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
  }, [commentQuery.data, relatedCommentQuery.data]);

  const onExpandButtonPress = async (expandDocumentId: any) => {
    setExpandDocumentId(expandDocumentId);
    setExpandDocumentIds((prev: any) => _.uniq([...prev, expandDocumentId]));
  };

  const onExpandMoreButtonPress = async (expandDocumentId: any) => {
    setExpandDocumentId(expandDocumentId);
    if (relatedCommentQuery.hasNextPage && !relatedCommentQuery.isFetchingNextPage) {
      relatedCommentQuery.fetchNextPage();
    }
  };

  const onSubmit = (formData: CommentFormSchema) => {
    const data = {
      content: formData.content,
      user: user.documentId,
      post: postDocumentId,
      reply: replyDocumentId,
      topComment: replyTopDocumentId,
    };

    createMutation.mutate(data, {
      async onSuccess(data: any) {
        toast.success({ description: '评论已发布' });
        await queryClient.invalidateQueries({
          queryKey: ['posts', 'detail', postDocumentId],
        });

        setExpandDocumentId(data.topComment.documentId);
        setExpandDocumentIds((prev: any) => _.uniq([...prev, data.topComment.documentId]));
        reset({ content: '' });
      },
      onError(error: any) {
        toast.error({ description: error.message });
        reset({ content: '' });
      },
    });
  };

  const onCollapseButtonPress = async (section: any) => {
    setExpandDocumentIds((prev: any) =>
      _.filter(prev, (documentId: string) => documentId !== section.documentId),
    );
  };

  const onReplyButtonPress = (
    replyTopDocumentId: string,
    replyDocumentId: string,
    username: string,
  ) => {
    setReplyTopDocumentId(replyTopDocumentId);
    setReplyDocumentId(replyDocumentId);
    setReplyUsername(username);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  const onDeleteButtonPress = (documentId: string, topDocumentId: string | null) => {
    deleteMutation.mutate(
      {
        documentId,
        topDocumentId,
      },
      {
        onSuccess: () => {
          toast.success({ description: '评论已删除' });
          queryClient.invalidateQueries({
            queryKey: ['posts', 'detail', postDocumentId],
          });
        },
        onError(error: any) {
          toast.error({ description: error.message });
        },
      },
    );
  };

  const renderSectionHeader = ({ section }: any) => {
    return (
      <HStack className="my-2 items-start" space="sm">
        <Box className="w-10">
          <Avatar size="sm" className="my-1">
            <AvatarImage
              source={{
                uri: `${apiServerURL}${section.user.avatar?.formats.thumbnail.url}`,
              }}
            />
            <AvatarFallbackText>{section.user.username}</AvatarFallbackText>
          </Avatar>
        </Box>
        <VStack className="flex-1 items-start justify-start">
          <Text bold={true}>{section.user.username}</Text>
          <Text size="sm">{section.content}</Text>
          <HStack className="items-center justify-between">
            <HStack className="items-center">
              <Text size="sm">{format(section.createdAt, 'yyyy-MM-dd HH:mm:ss')}</Text>
              <Button
                size="sm"
                variant="link"
                className="mx-2"
                onPress={() =>
                  onReplyButtonPress(section.documentId, section.documentId, section.user.username)
                }>
                <ButtonText>回复</ButtonText>
              </Button>

              {section.user.documentId === user?.documentId && (
                <Button
                  size="sm"
                  action="secondary"
                  variant="link"
                  className="mx-2"
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
                  className="mx-2"
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
      <HStack className="items-center" space="sm">
        <Box className="w-10" />
        <HStack>
          {relatedCommentQuery.hasNextPage && (
            <Button
              size="sm"
              variant="link"
              action="secondary"
              className="mx-2"
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
                className="mx-2"
                onPress={() => onCollapseButtonPress(section)}>
                <ButtonText>收起</ButtonText>
              </Button>
            )}
        </HStack>
      </HStack>
    );
  };

  const renderCommentItem = ({ item }: any) => {
    return _.includes(expandDocumentIds, item.topComment.documentId) ? (
      <HStack className="my-1 ml-10 items-start" space="sm">
        <Avatar size="xs" className="my-1">
          <AvatarImage
            source={{ uri: `${apiServerURL}${item.user.avatar?.formats.thumbnail.url}` }}
          />
          <AvatarFallbackText>{item.user.username}</AvatarFallbackText>
        </Avatar>
        <VStack className="flex-1 items-start justify-start">
          <HStack space="xs" className="items-center">
            <Text bold={true}>{item.user.username}</Text>
            {item.reply && (
              <>
                <Text>►</Text>
                <Text bold={true}>{item.reply.user.username}</Text>
              </>
            )}
          </HStack>
          <Text size="sm">{item.content}</Text>
          <HStack className="items-center justify-between">
            <HStack className="items-center">
              <Text size="sm">{format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}</Text>
              <Button
                size="sm"
                variant="link"
                className="mx-2"
                onPress={() =>
                  onReplyButtonPress(
                    item.topComment.documentId,
                    item.documentId,
                    item.user.username,
                  )
                }>
                <ButtonText>回复</ButtonText>
              </Button>
              {item.user.documentId === user?.documentId && (
                <Button
                  size="sm"
                  variant="link"
                  action="secondary"
                  className="mx-2"
                  onPress={() => onDeleteButtonPress(item.documentId, item.topComment.documentId)}>
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
      setReplyDocumentId(null);
      setReplyTopDocumentId(null);
      setReplyUsername(null);
    };
    return (
      <FormControl className="flex-1" isInvalid={!!errors.content} size="md">
        <Input className="flex-1 bg-background-50" variant="rounded">
          <BottomSheetTextInput
            ref={inputRef}
            inputMode="text"
            autoCapitalize="none"
            className="h-full flex-1 px-3"
            returnKeyType="send"
            placeholder={replyDocumentId ? `回复 ${replyUsername}` : '输入评论...'}
            value={value}
            onChangeText={onChange}
            onBlur={handleBlur}
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
      <BottomSheetFooter {...props} bottomInset={insets.bottom}>
        {user && (
          <HStack className="bg-background-100 p-2">
            <Controller name="content" control={control} render={renderCommentInput} />
          </HStack>
        )}
      </BottomSheetFooter>
    );
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}>
      <VStack className="flex-1 bg-background-100 p-4" space="md">
        <VStack className="mb-4 items-center">
          <Heading className="p-2">{`${commentCount}条评论`}</Heading>
          <Divider />
        </VStack>
        <BottomSheetSectionList
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
