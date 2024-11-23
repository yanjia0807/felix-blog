import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createComment,
  fetchChildComments,
  fetchPostComments,
  fetchPostCommentTotal,
} from '@/api/comment';
import { HStack } from './ui/hstack';
import { VStack } from './ui/vstack';
import { Text } from './ui/text';
import { Avatar, AvatarImage } from './ui/avatar';
import { baseURL } from '@/api';
import _ from 'lodash';
import {
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetSectionList,
  BottomSheetTextInput,
  TouchableOpacity,
} from '@gorhom/bottom-sheet';
import { BottomSheetBackdrop, BottomSheetDragIndicator } from './ui/bottomsheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heading } from './ui/heading';
import { Button, ButtonText } from './ui/button';
import { Icon } from './ui/icon';
import { Heart, HeartCrack } from 'lucide-react-native';
import moment from 'moment';
import { Box } from './ui/box';
import { useAuth } from './auth-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useCustomToast from './use-custom-toast';

type CommentSchemaDetails = z.infer<typeof commentSchema>;

const commentSchema = z.object({
  content: z.string({
    required_error: '请填写内容',
  }),
});

const PostCommentsSheet = forwardRef(({ postDocumentId }: any, ref: any) => {
  const [replyComment, setReplyComment] = useState<any>();
  const [selectedDocumentId, setSelectedDocumentId] = useState<any>(null);
  const [commentData, setCommentData] = useState<any>([]);
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

  const { isSuccess, data: comments } = useQuery<any>({
    queryKey: ['comments', postDocumentId],
    queryFn: () => fetchPostComments({ postDocumentId }),
  });

  const {
    isLoading: isLoadingChildComments,
    isSuccess: isChildCommentsSuccess,
    isError: isChildCommentsError,
    data: childComments,
    refetch: refetchChildComments,
  } = useQuery<any>({
    queryKey: ['comments', postDocumentId, selectedDocumentId],
    queryFn: () => fetchChildComments({ topCommentDocumentId: selectedDocumentId }),
    enabled: !!selectedDocumentId,
  });

  const { data: total } = useQuery<any>({
    queryKey: ['comments', postDocumentId, 'total'],
    queryFn: () => fetchPostCommentTotal({ postDocumentId }),
  });

  const {
    mutate,
    isPending: isCreatePending,
    isSuccess: isCreateSuccess,
    isError: isCreateError,
  } = useMutation({
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

  useEffect(() => {
    let data: any = {};
    if (isSuccess) {
      data = {
        data: _.map(comments.data, (item: any) => ({
          ...item,
          title: item.content,
          data: [],
        })),
        meta: comments.meta,
      };

      if (isChildCommentsSuccess) {
        const topComment = _.find(data.data, (item: any) => item.documentId === selectedDocumentId);
        if (topComment) {
          topComment.data = childComments.data;
        }
      }
    }
    if (data && data.data && data.data[0]) {
      console.log('data.data[0].data', data.data[0].data);
    }

    setCommentData(data);
  }, [isSuccess, isChildCommentsSuccess, comments, selectedDocumentId, childComments]);

  const onLoadChildCommentButtonPressed = (documentId: string) => {
    console.log('onLoadChildCommentButtonPressed', documentId);
    setSelectedDocumentId(documentId);
    refetchChildComments();
  };

  const onReplyButtonPressed = (documentId: string, topDocumentId: string) => {
    console.log('onReplyButtonPressed', documentId, topDocumentId);
    inputRef.current?.focus();
    setReplyComment({
      documentId,
      topDocumentId,
    });
  };

  const onSubmit = (data: CommentSchemaDetails) => {
    const comment = {
      content: data.content,
      user: user.documentId,
      post: postDocumentId,
      reply: replyComment?.documentId,
      topComment: replyComment?.topDocumentId,
    };

    mutate(comment, {});
  };

  const renderSectionHeader = ({ section }: any) => {
    return (
      <HStack className="my-4 items-start" space="sm">
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
                onPress={() => onReplyButtonPressed(section.documentId, section.documentId)}>
                <ButtonText size="sm" className="font-bold">
                  回复
                </ButtonText>
              </Button>
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
          <HStack>
            <Button size="sm" onPress={() => onLoadChildCommentButtonPressed(section.documentId)}>
              <ButtonText size="sm">展开回复</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </HStack>
    );
  };

  const renderSectionFooter = ({ section }: any) => {
    if (section.data.length > 0) {
      return (
        <HStack className="items-center justify-end">
          <Button size="sm">
            <ButtonText>收起</ButtonText>
          </Button>
        </HStack>
      );
    } else {
      return <></>;
    }
  };

  const renderCommentItem = ({ item }: any) => {
    return (
      <HStack className="my-2 ml-10 items-start" space="sm">
        <Avatar size="xs" className="my-1">
          <AvatarImage
            source={{ uri: `${baseURL}/${item.user.profile.avatar?.formats.thumbnail.url}` }}
          />
        </Avatar>
        <VStack className="flex-1 items-start justify-start">
          <HStack space="sm">
            <Text>{item.user.username}</Text>
            <Text>►</Text>
            <Text>{item.reply.user.username}</Text>
          </HStack>

          <Text size="sm">{item.content}</Text>
          <HStack className="items-center justify-between">
            <HStack className="items-center">
              <Text size="sm">{moment(item.createdAt).format('YYYY-MM-DD HH:mm')}</Text>
              <Button
                size="sm"
                onPress={() => onReplyButtonPressed(item.documentId, item.topComment.documentId)}>
                <ButtonText size="sm" className="font-bold">
                  回复
                </ButtonText>
              </Button>
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

  const renderCommentInput = useCallback(
    ({ field: { onChange, onBlur, value } }: any) => {
      return (
        <BottomSheetTextInput
          ref={inputRef}
          inputMode="text"
          returnKeyType="send"
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          onSubmitEditing={handleSubmit(onSubmit)}
          className="m-2 h-10 flex-1 rounded-2xl border border-gray-100 bg-gray-50 p-2"
        />
      );
    },
    [handleSubmit, onSubmit],
  );

  const renderFooter = useCallback(
    (props: any) => {
      return (
        <BottomSheetFooter {...props}>
          <Box className="flex-1">
            <Controller name="content" control={control} render={renderCommentInput} />
          </Box>
        </BottomSheetFooter>
      );
    },
    [renderCommentInput],
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
    <BottomSheetModal
      snapPoints={['100%']}
      enableDynamicSizing={false}
      backdropComponent={BottomSheetBackdrop}
      handleComponent={BottomSheetDragIndicator}
      footerComponent={renderFooter}
      topInset={insets.top}
      bottomInset={insets.bottom}
      keyboardBehavior="interactive"
      ref={ref}>
      <VStack className="flex-1 p-4" space="2xl">
        {isSuccess && (
          <BottomSheetSectionList
            sections={commentData.data}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={renderCommentItem}
            renderSectionHeader={renderSectionHeader}
            renderSectionFooter={renderSectionFooter}
            ListHeaderComponent={renderHeaderComponent}
            ListEmptyComponent={renderEmptyComponent}
            showsVerticalScrollIndicator={false}
            extraData={[comments, childComments]}
            stickySectionHeadersEnabled={false}
          />
        )}
      </VStack>
    </BottomSheetModal>
  );
});

export default PostCommentsSheet;
