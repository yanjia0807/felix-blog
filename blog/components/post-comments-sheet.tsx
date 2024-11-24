import React, {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import BottomSheet, {
  BottomSheetFooter,
  BottomSheetSectionList,
  BottomSheetTextInput,
  TouchableOpacity,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, HeartCrack } from 'lucide-react-native';
import moment from 'moment';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  createComment,
  deleteComment,
  fetchPostComments,
  fetchPostCommentTotal,
  fetchRelatedComments,
} from '@/api/comment';
import { baseURL } from '@/api';
import { HStack } from './ui/hstack';
import { VStack } from './ui/vstack';
import { Text } from './ui/text';
import { Avatar, AvatarImage } from './ui/avatar';
import { BottomSheetBackdrop, BottomSheetDragIndicator } from './ui/bottomsheet';
import { Heading } from './ui/heading';
import { Button, ButtonText } from './ui/button';
import { Icon } from './ui/icon';
import { Box } from './ui/box';
import { useAuth } from './auth-context';
import useCustomToast from './use-custom-toast';

type CommentSchemaDetails = z.infer<typeof commentSchema>;

const commentSchema = z.object({
  content: z.string({
    required_error: '请填写内容',
  }),
});

const PostCommentsSheet = forwardRef(({ postDocumentId }: any, ref: any) => {
  const [replyComment, setReplyComment] = useState<any>();
  const [expandedComment, setExpandedComment] = useState<any>(null);
  const [commentData, setCommentData] = useState<any>([]);
  const [snapPoints, setSnapPoints] = useState(['50%', '100%']);
  const inputRef = useRef<any>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useCustomToast();
  const insets = useSafeAreaInsets();

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
    data: comments,
    isSuccess: isFetchCommentsSuccess,
    isFetchingNextPage: isFetchingNextCommentsPage,
    fetchNextPage: fetchNextCommentsPage,
    hasNextPage: hasNextCommentsPage,
  } = useInfiniteQuery<any>({
    queryKey: ['comments', postDocumentId],
    queryFn: () => fetchPostComments({ postDocumentId }),
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 1,
      },
    },
    getNextPageParam: (lastPage: any) => {
      const {
        meta: {
          pagination: { page, pageSize, pageCount, total },
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
    data: relatedCommentsData,
    isSuccess: isFetchRelatedCommentsSuccess,
    refetch: refetchRelatedComments,
  } = useQuery<any>({
    queryKey: [
      'comments',
      postDocumentId,
      expandedComment?.documentId,
      expandedComment?.pagination,
    ],
    queryFn: () =>
      fetchRelatedComments({
        topDocumentId: expandedComment?.documentId,
        pagination: expandedComment?.pagination,
      }),
    enabled: !!expandedComment,
  });

  const { data: total } = useQuery<any>({
    queryKey: ['comments', postDocumentId, 'total'],
    queryFn: () => fetchPostCommentTotal({ postDocumentId }),
  });

  const { mutate: createMutate } = useMutation({
    mutationFn: (comment: any) => {
      return createComment(comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postDocumentId] });
      setReplyComment(null);
      reset();
      toast.success({ title: '操作成功', description: '评论已提交' });
    },
    onError(error, variables, context) {
      toast.error(error.message);
    },
  });

  const { mutate: deleteMutate } = useMutation({
    mutationFn: (documentId: string) => {
      return deleteComment(documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postDocumentId] });
      reset();
      toast.success({ title: '操作成功', description: '评论已删除' });
    },
    onError(error, variables, context) {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (isFetchCommentsSuccess) {
      const data = _.reduce(
        comments?.pages,
        (result: any, data: any) => [
          ...result,
          ..._.map(data.data, (item: any) => ({
            ...item,
            title: item.content,
            pagination: {
              page: 1,
            },
            data: [],
            expanded: false,
          })),
        ],
        [],
      );

      setCommentData(data);
    }
  }, [comments, isFetchCommentsSuccess]);

  useEffect(() => {
    if (isFetchRelatedCommentsSuccess) {
      setCommentData((prev: any) => {
        return _.map(prev, (item: any) => {
          if (item.documentId === expandedComment?.documentId) {
            return {
              ...item,
              data: [...item.data, ...relatedCommentsData.data],
              pagination: relatedCommentsData.meta.pagination,
            };
          } else {
            return item;
          }
        });
      });
    }
  }, [relatedCommentsData, isFetchRelatedCommentsSuccess]);

  useLayoutEffect(() => {
    if (replyComment && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [replyComment]);

  const onExpandButtonPressed = (documentId: string, pagination: any) => {
    console.log('onExpandButtonPressed', documentId);
    setCommentData((prev: any) => {
      return _.map(prev, (item: any) => {
        if (item.documentId === documentId) {
          return {
            ...item,
            expanded: true,
          };
        } else {
          return item;
        }
      });
    });
    setExpandedComment({ documentId, pagination });
    refetchRelatedComments();
  };

  const onCollapseButtonPressed = (documentId: string) => {
    console.log('onCollapseButtonPressed', documentId);
    setCommentData((prev: any) => {
      return _.map(prev, (item: any) => {
        if (item.documentId === documentId) {
          return {
            ...item,
            data: [],
            pagination: {
              page: 1,
            },
            expanded: false,
          };
        } else {
          return item;
        }
      });
    });
    setExpandedComment(null);
  };

  const onLoadMoreButtonPressed = (documentId: string, pagination: any) => {
    console.log('onLoadMoreButtonPressed', documentId, pagination);
    setExpandedComment({
      documentId,
      pagination: {
        ...pagination,
        page: pagination.page + 1,
      },
    });
    refetchRelatedComments();
  };

  const onReplyButtonPressed = (documentId: string, topDocumentId: string, username: string) => {
    console.log('onReplyButtonPressed', documentId, topDocumentId);

    setReplyComment({
      documentId,
      topDocumentId,
      username,
    });
  };

  const onDeleteButtonPress = (documentId: string) => {
    deleteMutate(documentId);
  };

  const renderSectionHeader = ({ section }: any) => {
    return (
      <HStack className="my-2 items-start" space="sm">
        <Box className="w-10">
          <Avatar size="sm" className="my-1">
            <AvatarImage
              source={{ uri: `${baseURL}/${section.user.profile.avatar?.formats.thumbnail.url}` }}
            />
          </Avatar>
        </Box>
        <VStack className="flex-1 items-start justify-start">
          <Text>{section.user.username}</Text>
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

              {section.user.documentId === user.documentId && (
                <Button
                  size="sm"
                  variant="link"
                  className="mx-2"
                  onPress={() => onDeleteButtonPress(section.documentId)}>
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
          {section.relatedComments.count > 0 && !section.expanded && (
            <HStack>
              <Button
                size="sm"
                variant="link"
                className="mx-2"
                onPress={() => onExpandButtonPressed(section.documentId, section.pagination)}>
                <ButtonText>展开回复</ButtonText>
              </Button>
            </HStack>
          )}
        </VStack>
      </HStack>
    );
  };

  const renderSectionFooter = ({ section }: any) => {
    if (section.data.length > 0) {
      return (
        <HStack className="items-center" space="sm">
          <Box className="w-10" />
          <HStack>
            {section.pagination.pageCount &&
              section.pagination.page < section.pagination.pageCount && (
                <Button
                  size="sm"
                  variant="link"
                  className="mx-2"
                  onPress={() => onLoadMoreButtonPressed(section.documentId, section.pagination)}>
                  <ButtonText>展开更多</ButtonText>
                </Button>
              )}
            <Button
              size="sm"
              variant="link"
              className="mx-2"
              onPress={() => onCollapseButtonPressed(section.documentId)}>
              <ButtonText>收起</ButtonText>
            </Button>
          </HStack>
        </HStack>
      );
    } else {
      return <></>;
    }
  };

  const renderCommentItem = ({ item }: any) => {
    return (
      <HStack className="my-1 ml-10 items-start" space="sm">
        <Avatar size="xs" className="my-1">
          <AvatarImage
            source={{ uri: `${baseURL}/${item.user.profile.avatar?.formats.thumbnail.url}` }}
          />
        </Avatar>
        <VStack className="flex-1 items-start justify-start">
          <HStack space="xs" className="items-center">
            <Text>{item.user.username}</Text>
            {item.reply && (
              <>
                <Text>►</Text>
                <Text>{item.reply.user.username}</Text>
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
              {item.user.documentId === user.documentId && (
                <Button
                  size="sm"
                  variant="link"
                  className="mx-2"
                  onPress={() => onDeleteButtonPress(item.documentId)}>
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
    );
  };

  const onSubmit = useCallback(
    (data: CommentSchemaDetails) => {
      const comment = {
        content: data.content,
        user: user.documentId,
        post: postDocumentId,
        reply: replyComment?.documentId,
        topComment: replyComment?.topDocumentId,
      };

      createMutate(comment, {});
    },
    [replyComment],
  );

  const renderFooter = useCallback(
    (props: any) => {
      return (
        <BottomSheetFooter {...props}>
          <Box className="flex-1 bg-gray-100">
            <Controller
              name="content"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <BottomSheetTextInput
                  ref={inputRef}
                  inputMode="text"
                  returnKeyType="send"
                  value={value}
                  placeholder={replyComment ? `回复 ${replyComment.username}` : '输入评论...'}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleSubmit(onSubmit)}
                  className="m-2 h-10 flex-1 rounded-2xl border border-gray-200 bg-gray-300 p-2"
                />
              )}
            />
          </Box>
        </BottomSheetFooter>
      );
    },
    [control, handleSubmit, onSubmit, replyComment],
  );

  const renderHeaderComponent = (props: any) => {
    return <Heading size="sm">{`${total}条评论`}</Heading>;
  };

  const renderEmptyComponent = (props: any) => {
    return (
      <Box className="mt-10 w-full items-center justify-center">
        <Text size="sm">暂无评论</Text>
      </Box>
    );
  };

  return (
    <BottomSheet
      snapPoints={snapPoints}
      index={-1}
      enableDynamicSizing={false}
      backdropComponent={BottomSheetBackdrop}
      handleComponent={BottomSheetDragIndicator}
      footerComponent={renderFooter}
      enablePanDownToClose={true}
      topInset={insets.top}
      bottomInset={insets.bottom}
      keyboardBehavior="interactive"
      ref={ref}>
      <VStack className="bg-white p-4" space="2xl">
        {isFetchCommentsSuccess && (
          <BottomSheetSectionList
            sections={commentData}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={renderCommentItem}
            renderSectionHeader={renderSectionHeader}
            renderSectionFooter={renderSectionFooter}
            ListHeaderComponent={renderHeaderComponent}
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
    </BottomSheet>
  );
});

export default PostCommentsSheet;
