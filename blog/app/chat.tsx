import { zodResolver } from '@hookform/resolvers/zod';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft, Ellipsis } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FlatList } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { z } from 'zod';
import { apiServerURL, createChat, fetchChat, fetchChatByUsers, fetchMessagesByChat } from '@/api';
import { createMessage, updateChatStatus } from '@/api';
import { useAuth } from '@/components/auth-context';
import { useSocket } from '@/components/socket-context';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
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
import useCustomToast from '@/components/use-custom-toast';

type MessageFormSchema = z.infer<typeof messageFormSchema>;

const messageFormSchema = z.object({
  content: z.string().min(1, '内容不能为空').max(100, '内容不能多余5000个字符'),
});

const Chat = () => {
  const { user: currentUser } = useAuth();
  const { userDocumentIds: userDocumentIdsStr, documentId }: any = useLocalSearchParams();
  const userDocumentIds = _.split(userDocumentIdsStr, ',');
  const otherDocumentId: any = _.find(
    userDocumentIds,
    (item: any) => item !== currentUser.documentId,
  );
  const [chatData, setChatData] = useState<any>();
  const flatListRef = useRef<FlatList>(null);
  const toast = useCustomToast();
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

  const { mutate: createChatMutate } = useMutation({
    mutationFn: ({ users }: any) =>
      createChat({
        users,
      }),
    onSuccess: async (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['chats', 'detail', { userDocumentIds }] });
      await queryClient.invalidateQueries({
        queryKey: ['chats', 'list'],
      });
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

  const {
    data: messageRes,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingMessage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['chats', 'detail', chatData?.documentId, 'messsages'],
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

  const { data: userChat, isSuccess: isQueryUserChatSuccess } = useQuery({
    queryKey: ['chats', 'detail', { userDocumentIds }],
    enabled: !documentId,
    queryFn: () => {
      return fetchChatByUsers({ userDocumentIds });
    },
  });

  const { data: currentChat, isSuccess: isQueryChatSuccess } = useQuery({
    queryKey: ['chats', 'detail', documentId],
    enabled: !!documentId,
    queryFn: () => fetchChat({ documentId, userDocumentId: currentUser.documentId }),
  });

  useEffect(() => {
    if (documentId) {
      if (currentChat) {
        setChatData({ ...currentChat });
      }
    } else {
      if (isQueryUserChatSuccess) {
        if (userChat) {
          setChatData({ ...userChat });
        } else {
          createChatMutate({ users: [currentUser.documentId, otherDocumentId] });
        }
      }
    }
  }, [documentId, isQueryUserChatSuccess, currentChat, userChat, currentUser, otherDocumentId]);

  useEffect(() => {
    return () => {
      if (chatData) {
        chatStatusMutate({
          documentId: chatData.chatStatuses[0].documentId,
        });
      }
    };
  }, [chatData]);

  let otherUser: any = null,
    messageData: any = [];
  if (chatData) {
    otherUser = _.find(chatData.users, (item: any) => item.documentId !== currentUser.documentId);
    const incomeMessages = _.filter(
      messages,
      (item: any) =>
        (item.sender.documentId === currentUser.documentId &&
          item.receiver.documentId === otherUser.documentId) ||
        (item.sender.documentId === otherUser.documentId &&
          item.receiver.documentId === currentUser.documentId),
    );
    const cacheMessages = _.reduce(
      messageRes?.pages,
      (result: any, page: any) => [...result, ...page.data],
      [],
    );

    messageData = _.concat(incomeMessages, cacheMessages);
  }

  const renderHeaderLeft = () => (
    <HStack className="items-center" space="xl">
      <Button
        action="secondary"
        variant="link"
        onPress={() => {
          router.back();
        }}>
        <ButtonIcon as={ChevronLeft} />
        <ButtonText>返回</ButtonText>
      </Button>
      <HStack className="items-center" space="sm">
        <Avatar size="md">
          <AvatarImage
            source={{ uri: `${apiServerURL}/${otherUser?.avatar?.formats.thumbnail.url}` }}
          />
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
          <AvatarImage
            source={{ uri: `${apiServerURL}/${otherUser?.avatar?.formats.thumbnail.url}` }}
          />
        </Avatar>
        <HStack className="flex-1 items-center justify-between">
          <Card size="md" variant="elevated" className="m-3 w-2/3 rounded-md bg-primary-300 p-4">
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
    <FormControl size="lg" isInvalid={!!errors.content}>
      <Input variant="rounded" size="md">
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
      <KeyboardAvoidingView className="flex-1" behavior={'padding'} keyboardVerticalOffset={100}>
        <VStack className="flex-1 justify-between px-4">
          <FlatList
            ref={flatListRef}
            data={messageData}
            inverted={true}
            keyExtractor={(item: any) => item.documentId}
            renderItem={renderMessageItem}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
          />
          <Controller name="content" control={control} render={renderInput} />
        </VStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;
