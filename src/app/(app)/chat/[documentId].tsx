import React, { useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft, Ellipsis } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { FlatList } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { z } from 'zod';
import { fetchChat, fetchMessagesByChat } from '@/api';
import { createMessage, updateChatStatus } from '@/api';
import { useAuth } from '@/components/auth-provider';
import { useSocket } from '@/components/socket-provider';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormControl } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import useToast from '@/hooks/use-custom-toast';
import { imageFormat } from '@/utils/file';
import { PageFallbackUI } from '@/components/fallback';

type MessageFormSchema = z.infer<typeof messageFormSchema>;

const messageFormSchema = z.object({
  content: z.string().min(1, '内容不能为空').max(100, '内容不能多余5000个字符'),
});

const ChatPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { documentId }: any = useLocalSearchParams();
  const flatListRef = useRef<FlatList>(null);
  const toast = useToast();
  const { messages, setMessages } = useSocket();
  const queryClient = useQueryClient();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<MessageFormSchema>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      content: '',
    },
  });

  const { mutate: chatStatusMutate } = useMutation({
    mutationFn: (data: any) => updateChatStatus(data),
    onSuccess: async (data: any) => {
      queryClient.setQueryData(['chats', 'list'], (oldData: any) => {
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((item: any) =>
              item.id === chatData.id
                ? {
                    ...item,
                    chatStatuses: [
                      {
                        ...item.chatStatuses[0],
                        unreadCount: 0,
                      },
                    ],
                  }
                : { ...item },
            ),
          })),
        };
      });
    },
    onError(error, variables, context) {
      toast.error({ description: error.message });
    },
  });

  const { mutate: createMessageMutate } = useMutation({
    mutationFn: (data: any) => createMessage(data),
    onSuccess: async (data: any) => {
      setMessages((oldData: any) => {
        return [data, ...oldData];
      });

      queryClient.setQueryData(['chats', 'list'], ({ pages, pageParams }: any) => ({
        pages: _.map(pages, (page: any) => ({
          data: _.map(page.data, (item: any) =>
            item.documentId === data.chat.documentId
              ? {
                  ...item,
                  lastMessage: {
                    id: data.id,
                    documentId: data.documentId,
                    createdAt: data.createdAt,
                    content: data.content,
                  },
                }
              : { ...item },
          ),
          meta: page.meta,
        })),
        pageParams,
      }));

      if (messageData.length > 0) {
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
      }
    },
    onError(error, variables, context) {
      toast.error({ description: error.message });
    },
    onSettled(data, error, variables, context) {
      reset();
    },
  });

  const { data: chatData, isSuccess: isQueryChatSuccess } = useQuery({
    queryKey: ['chats', 'detail', documentId],
    queryFn: () => fetchChat({ documentId, userDocumentId: currentUser.documentId }),
  });

  const {
    data: messageRes,
    fetchNextPage,
    hasNextPage,
    isSuccess: isQueryMessageSuccess,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['chats', 'detail', documentId, 'messsages'],
    queryFn: fetchMessagesByChat,
    enabled: !!chatData?.documentId,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 10,
      },
      filters: {
        chatDocumentId: chatData?.documentId,
        excludeDocumentIds: _.map(messages, 'documentId'),
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
          filters: {
            chatDocumentId: chatData?.documentId,
            excludeDocumentIds: _.map(messages, 'documentId'),
          },
        };
      }

      return null;
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    return () => {
      if (chatData) {
        chatStatusMutate({
          documentId: chatData.chatStatuses[0].documentId,
        });
      }
    };
  }, [chatData, chatStatusMutate]);

  const otherUser = isQueryChatSuccess
    ? _.find(chatData.users, (item: any) => item.documentId !== currentUser.documentId)
    : null;

  const incomeMessages = isQueryChatSuccess
    ? _.filter(
        messages,
        (item: any) =>
          (item.sender.documentId === currentUser.documentId &&
            item.receiver.documentId === otherUser.documentId) ||
          (item.sender.documentId === otherUser.documentId &&
            item.receiver.documentId === currentUser.documentId),
      )
    : [];

  const cacheMessages = isQueryMessageSuccess
    ? _.reduce(messageRes?.pages, (result: any, page: any) => [...result, ...page.data], [])
    : [];

  const messageData = _.concat(incomeMessages, cacheMessages);

  const renderHeaderLeft = () => (
    <>
      {isQueryChatSuccess ? (
        <HStack className="items-center" space="xl">
          <Button action="secondary" variant="link" onPress={() => router.back()}>
            <ButtonIcon as={ChevronLeft} />
            <ButtonText>返回</ButtonText>
          </Button>
          <HStack className="items-center" space="sm">
            <Avatar size="md">
              <AvatarFallbackText>{otherUser?.username}</AvatarFallbackText>
              <AvatarImage source={{ uri: imageFormat(otherUser.avatar, 's', 't')?.fullUrl }} />
            </Avatar>
            <VStack>
              <Heading size="sm" bold={true}>
                {otherUser?.username}
              </Heading>
              <Text size="xs" className="text-success-500">
                在线
              </Text>
            </VStack>
          </HStack>
        </HStack>
      ) : null}
    </>
  );

  const renderHeaderRight = () => <Icon as={Ellipsis} />;

  const renderMessageItem = ({ item }: any) =>
    item.sender.documentId === currentUser.documentId
      ? renderSenderItem({ item })
      : renderReceiverItem({ item });

  const renderSenderItem = ({ item }: any) => {
    return (
      <HStack className="items-center justify-between">
        <Text size="sm">{format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}</Text>
        <Card size="md" variant="elevated" className="m-3 w-2/3 rounded-md bg-primary-300 p-4">
          <Text>{item.content}</Text>
        </Card>
      </HStack>
    );
  };

  const renderReceiverItem = ({ item }: any) => {
    return (
      <HStack>
        <Avatar size="xs">
          <AvatarFallbackText>{otherUser.username}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: imageFormat(otherUser.avatar, 's', 't')?.fullUrl,
            }}
          />
        </Avatar>
        <HStack className="flex-1 items-center justify-between">
          <Card size="md" variant="elevated" className="m-3 w-2/3 rounded-md bg-primary-200 p-4">
            <Text>{item.content}</Text>
          </Card>
          <Text size="sm" className="flex-1">
            {format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}
          </Text>
        </HStack>
      </HStack>
    );
  };

  const renderInput = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl size="lg" className="flex-1" isInvalid={!!errors.content}>
      <Input className="bg-background-200" variant="rounded">
        <InputField
          placeholder=""
          inputMode="text"
          autoCapitalize="none"
          returnKeyType="send"
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          onSubmitEditing={handleSubmit(onSubmit)}
        />
      </Input>
    </FormControl>
  );

  const onSubmit = ({ content }: MessageFormSchema) => {
    const data = {
      sender: currentUser.documentId,
      receiver: otherUser.documentId,
      chat: chatData.documentId,
      content,
    };
    return createMessageMutate(data);
  };

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerLeft: renderHeaderLeft,
          headerRight: renderHeaderRight,
        }}
      />
      <VStack className="flex-1 justify-between">
        <FlatList
          contentContainerClassName="flex-grow justify-end p-4"
          ref={flatListRef}
          data={messageData}
          inverted={true}
          initialNumToRender={10}
          keyExtractor={(item: any) => item.documentId}
          renderItem={renderMessageItem}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
        />
        <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={100}>
          <HStack className="bg-background-100 p-2">
            <Controller name="content" control={control} render={renderInput} />
          </HStack>
        </KeyboardAvoidingView>
      </VStack>
    </SafeAreaView>
  );
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default ChatPage;
