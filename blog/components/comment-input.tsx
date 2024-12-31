import {
  BottomSheetBackdrop,
  BottomSheetSectionList,
  BottomSheetTextInput,
  BottomSheetFooter,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { MessageSquare } from 'lucide-react-native';
import { Heart, HeartCrack } from 'lucide-react-native';
import moment from 'moment';
import React, { forwardRef, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
import { Avatar, AvatarImage } from './ui/avatar';
import { Box } from './ui/box';
import { Button, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Input } from './ui/input';
import { Pressable } from './ui/pressable';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';
import useCustomToast from './use-custom-toast';

type CommentSchemaDetails = z.infer<typeof commentSchema>;

const commentSchema = z.object({
  content: z.string({
    required_error: '请填写内容',
  }),
});

export const CommentInput = ({ postDocumentId, count = 0 }: any) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const onInputIconPressed = () => {
    bottomSheetRef.current?.present();
  };

  return (
    <>
      <Pressable onPress={() => onInputIconPressed()}>
        <HStack space="xs" className="items-center">
          <Icon as={MessageSquare} />
          <Text size="xs">{count}</Text>
        </HStack>
      </Pressable>
      <CommentSheet ref={bottomSheetRef} postDocumentId={postDocumentId} count={count} />
    </>
  );
};

const CommentSheet = forwardRef(function Sheet({ postDocumentId, count = 0 }: any, ref: any) {
  const { user } = useAuth();
  const [replyComment, setReplyComment] = useState<any>();
  const [selectCommentDocumentId, setSelectCommentDocumentId] = useState<any>();
  const [expandCommentIds, setExpandCommentIds] = useState<any>([]);
  const inputRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const toast = useCustomToast();
  const snapPoints = useMemo(() => ['50%', '90%'], []);
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    if (replyComment && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [replyComment]);

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<CommentSchemaDetails>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: '',
    },
  });

  const {
    data: topComments,
    isSuccess: isFetchCommentsSuccess,
    isFetchingNextPage: isFetchingNextCommentsPage,
    fetchNextPage: fetchNextCommentsPage,
    hasNextPage: hasNextCommentsPage,
  } = useInfiniteQuery<any>({
    queryKey: ['comments', 'list', postDocumentId],
    queryFn: ({ pageParam }) => fetchPostComments(pageParam),
    initialPageParam: {
      postDocumentId,
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
          pagination: { page: page + 1, pageSize },
        };
      }

      return null;
    },
  });

  const {
    data: relatedComments,
    isFetchingNextPage: isFetchingNextRelatedCommentsPage,
    fetchNextPage: fetchNextRelatedCommentsPage,
    hasNextPage: hasNextRelatedCommentsPage,
  } = useInfiniteQuery<any>({
    queryKey: [postDocumentId, selectCommentDocumentId, 'comments'],
    queryFn: ({ pageParam }) => {
      return fetchRelatedComments(pageParam);
    },
    initialPageParam: {
      topCommentDocumentId: selectCommentDocumentId,
      pagination: {
        page: 1,
        pageSize: 1,
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
          topCommentDocumentId: selectCommentDocumentId,
          pagination: { page: page + 1, pageSize },
        };
      }

      return null;
    },
  });

  const sectionListData = useMemo(() => {
    let data: any = [];

    if (topComments) {
      const topCommentPageCache = _.reduce(
        topComments.pages,
        (result: any, page: any) => [...result, ...page.data],
        [],
      );

      data = _.map(topCommentPageCache, (item: any) => {
        const relatedCommentCache: any = queryClient.getQueryData([
          postDocumentId,
          item.documentId,
          'comments',
        ]);

        let relatedCommentPageCache = [];
        let hasNextPage = false;
        if (relatedCommentCache) {
          relatedCommentPageCache = _.reduce(
            relatedCommentCache.pages,
            (result: any, page: any) => [...result, ...page.data],
            [],
          );

          const lastPage = relatedCommentCache.pages[relatedCommentCache.pages.length - 1];
          if (lastPage) {
            const {
              meta: {
                pagination: { page, pageCount },
              },
            } = lastPage;
            hasNextPage = page < pageCount;
          }
        }

        return {
          ...item,
          hasNextPage,
          title: item.content,
          data: relatedCommentPageCache,
        };
      });
    }

    return data;
  }, [postDocumentId, queryClient, topComments, relatedComments]);

  const { mutate: createMutate } = useMutation({
    mutationFn: (comment: any) => {
      return createComment(comment);
    },
    onSuccess: (data: any, variables: any, context: unknown) => {
      toast.success({ title: '操作成功', description: '评论已发布' });
      queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', postDocumentId],
      });
      if (variables.topComment) {
        setExpandCommentIds((prev: any) => {
          const current = _.find(prev, (documentId: string) => documentId === variables.topComment);
          if (!current) {
            return [...prev, variables.topComment];
          } else {
            return [...prev];
          }
        });
        setSelectCommentDocumentId(variables.topComment);
        queryClient.invalidateQueries({
          queryKey: [postDocumentId, variables.topComment, 'comments'],
        });
        queryClient.setQueryData([postDocumentId, 'comments'], (oldData: any) => {
          return {
            pageParams: oldData.pageParams,
            pages: _.map(oldData.pages, (page: any) => {
              if (_.includes(_.map(page.data, 'documentId'), variables.topComment)) {
                _.find(page.data, (item: any) => item.documentId === variables.topComment)
                  .relatedComments.count++;
                return page;
              } else {
                return page;
              }
            }),
          };
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [postDocumentId, 'comments'],
        });
      }
    },
    onError(error, variables, context) {
      console.log(error);
      toast.error(error.message);
    },
  });

  const { mutate: deleteMutate } = useMutation({
    mutationFn: ({ documentId, topDocumentId }: any) => {
      return deleteComment(documentId);
    },
    onSuccess: (data: any, variables: any, context: unknown) => {
      toast.success({ title: '操作成功', description: '评论已删除' });
      queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', postDocumentId],
      });
      if (variables.topDocumentId) {
        queryClient.invalidateQueries({
          queryKey: [postDocumentId, variables.topDocumentId, 'comments'],
        });
        queryClient.setQueryData([postDocumentId, 'comments'], (oldData: any) => {
          return {
            pageParams: oldData.pageParams,
            pages: _.map(oldData.pages, (page: any) => {
              if (_.includes(_.map(page.data, 'documentId'), variables.topDocumentId)) {
                _.find(page.data, (item: any) => item.documentId === variables.topDocumentId)
                  .relatedComments.count--;
                return page;
              } else {
                return page;
              }
            }),
          };
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [postDocumentId, 'comments'],
        });
      }
    },
    onError(error, variables, context) {
      console.log(error);
      toast.error(error.message);
    },
  });

  const onExpandButtonPressed = async (section: any) => {
    setSelectCommentDocumentId(section.documentId);
    setExpandCommentIds((prev: any) => {
      const current = _.find(prev, (documentId: string) => documentId === section.documentId);
      if (!current) {
        return [...prev, section.documentId];
      } else {
        return [...prev];
      }
    });
    if (!isFetchingNextRelatedCommentsPage && hasNextRelatedCommentsPage) {
      fetchNextRelatedCommentsPage();
    }
  };

  const onCollapseButtonPressed = async (section: any) => {
    setExpandCommentIds((prev: any) => {
      return _.filter(prev, (documentId: string) => documentId !== section.documentId);
    });
  };

  const onReplyButtonPressed = (documentId: string, topDocumentId: string, username: string) => {
    setReplyComment({
      documentId,
      topDocumentId,
      username,
    });
  };

  const onDeleteButtonPress = (documentId: string, topDocumentId: string | null) => {
    deleteMutate({
      documentId,
      topDocumentId,
    });
  };

  const renderSectionHeader = ({ section }: any) => {
    return (
      <HStack className="my-2 items-start" space="sm">
        <Box className="w-10">
          <Avatar size="sm" className="my-1">
            <AvatarImage
              source={{
                uri: `${apiServerURL}/${section.user.avatar?.formats.thumbnail.url}`,
              }}
            />
          </Avatar>
        </Box>
        <VStack className="flex-1 items-start justify-start">
          <Text bold={true}>{section.user.username}</Text>
          <Text size="sm">{section.content}</Text>
          <HStack className="items-center justify-between">
            <HStack className="items-center">
              <Text size="sm">{moment(section.createdAt).format('YYYY-MM-DD HH:mm')}</Text>
              <Button
                size="sm"
                variant="link"
                className="mx-2"
                onPress={() =>
                  onReplyButtonPressed(
                    section.documentId,
                    section.documentId,
                    section.user.username,
                  )
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
            !_.includes(expandCommentIds, section.documentId) && (
              <HStack>
                <Button
                  size="sm"
                  variant="link"
                  action="secondary"
                  className="mx-2"
                  onPress={() => onExpandButtonPressed(section)}>
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
          {section.hasNextPage && (
            <Button
              size="sm"
              variant="link"
              action="secondary"
              className="mx-2"
              onPress={() => onExpandButtonPressed(section)}>
              <ButtonText>展开更多</ButtonText>
            </Button>
          )}
          {section.relatedComments.count > 0 &&
            _.includes(expandCommentIds, section.documentId) && (
              <Button
                size="sm"
                variant="link"
                action="secondary"
                className="mx-2"
                onPress={() => onCollapseButtonPressed(section)}>
                <ButtonText>收起</ButtonText>
              </Button>
            )}
        </HStack>
      </HStack>
    );
  };

  const renderCommentItem = ({ item }: any) => {
    return _.includes(expandCommentIds, item.topComment.documentId) ? (
      <HStack className="my-1 ml-10 items-start" space="sm">
        <Avatar size="xs" className="my-1">
          <AvatarImage
            source={{ uri: `${apiServerURL}/${item.user.avatar?.formats.thumbnail.url}` }}
          />
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
              <Text size="sm">{moment(item.createdAt).format('YYYY-MM-DD HH:mm')}</Text>
              <Button
                size="sm"
                variant="link"
                className="mx-2"
                onPress={() =>
                  onReplyButtonPressed(
                    item.documentId,
                    item.topComment.documentId,
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSubmit = (data: CommentSchemaDetails) => {
    const comment = {
      content: data.content,
      user: user.documentId,
      post: postDocumentId,
      reply: replyComment?.documentId,
      topComment: replyComment?.topDocumentId,
    };

    createMutate(comment);
  };

  const renderEmptyComponent = (props: any) => {
    return (
      <Box className="mt-10 w-full items-center justify-center">
        <Text size="sm">暂无评论</Text>
      </Box>
    );
  };

  const renderCommentInput = ({ field: { onChange, onBlur, value } }: any) => {
    return (
      <Input className="flex-1 bg-primary-100" variant="rounded">
        <BottomSheetTextInput
          inputMode="text"
          className="py-auto ios:leading-[0px] h-full flex-1 px-3 text-typography-900 placeholder:text-typography-500"
          returnKeyType="send"
          placeholder={replyComment ? `回复 ${replyComment.username}` : '输入评论...'}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          onSubmitEditing={handleSubmit(onSubmit)}
        />
      </Input>
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
        <HStack className="bg-background-50 p-2">
          {user && <Controller name="content" control={control} render={renderCommentInput} />}
        </HStack>
      </BottomSheetFooter>
    );
  };

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}>
      <VStack className="flex-1 bg-background-100 p-4" space="md">
        <VStack className="mb-4 items-center">
          <Heading className="p-2">{`${count}条评论`}</Heading>
          <Divider />
        </VStack>
        {isFetchCommentsSuccess && (
          <BottomSheetSectionList
            sections={sectionListData}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={renderCommentItem}
            renderSectionHeader={renderSectionHeader}
            renderSectionFooter={renderSectionFooter}
            ListEmptyComponent={renderEmptyComponent}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            onEndReached={() => {
              if (hasNextCommentsPage && !isFetchingNextCommentsPage) {
                fetchNextCommentsPage();
              }
            }}
          />
        )}
      </VStack>
    </BottomSheetModal>
  );
});
