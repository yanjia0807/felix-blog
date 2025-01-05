import { zodResolver } from '@hookform/resolvers/zod';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft, Ellipsis } from 'lucide-react-native';
import moment from 'moment';
import React, { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FlatList } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { apiServerURL, fetchChat } from '@/api';
import { createMessage, fetchMessages, updateChatStatus } from '@/api';
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

const Chat = () => {
  const { documentId } = useLocalSearchParams();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef();
  const toast = useCustomToast();
  const { messages: newMessages, setMessages } = useSocket();
  const queryClient = useQueryClient();
  type MessageSchemaDetails = z.infer<typeof messageSchema>;
  const messageSchema = z.object({
    content: z.string(),
  });

  const {
    isPending,
    isError,
    isSuccess,
    data: chatData,
    error,
  } = useQuery({
    queryKey: ['chats', 'detail', documentId],
    queryFn: () => fetchChat({ documentId, userDocumentId: user.documentId }),
  });

  const { mutate: sendMutate } = useMutation({
    mutationFn: (data: any) => createMessage(data),
    onSuccess: async (data: any) => {
      setMessages((oldData: any) => {
        return [data, ...oldData];
      });
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
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<MessageSchemaDetails>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: '',
    },
  });

  const otherUser: any = chatData && _.find(chatData.users, (item: any) => item.id !== user.id);

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['messages', { chatId: documentId }],
      queryFn: fetchMessages,
      initialPageParam: {
        pagination: {
          page: 1,
          pageSize: 20,
        },
        filters: {
          chatDocumentId: documentId,
          excludeDocumentIds: _.map(newMessages, 'documentId'),
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
              chatDocumentId: documentId,
              excludeDocumentIds: _.map(newMessages, 'documentId'),
            },
          };
        }

        return null;
      },
      staleTime: Infinity,
    });

  const messages: any = _.concat(
    [...newMessages],
    _.reduce(data?.pages, (result: any, page: any) => [...result, ...page.data], []),
  );

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

  const renderMessageListItem = ({ item }: any) =>
    item.sender.id === user.id ? renderSenderItem({ item }) : renderReceiverItem({ item });

  const renderSenderItem = ({ item }: any) => {
    return (
      <HStack className="items-center justify-between">
        <Text size="sm">{moment(item.createdAt).format('YYYY-MM-DD hh:mm')}</Text>
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
            {moment(item.createdAt).format('YYYY-MM-DD hh:mm')}
          </Text>
        </HStack>
      </HStack>
    );
  };

  const onSubmit = ({ content }: MessageSchemaDetails) => {
    const data = {
      sender: user.documentId,
      receiver: _.find(chatData?.users, (item: any) => item.id !== user.id)?.documentId,
      chat: chatData?.documentId,
      content,
    };

    return sendMutate(data);
  };

  useEffect(() => {
    return () => {
      if (chatData) {
        chatStatusMutate({ documentId: chatData?.chatStatuses[0].documentId });
      }
    };
  }, []);

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
            data={messages}
            inverted={true}
            keyExtractor={(item: any) => item.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={renderMessageListItem}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
          />
          <Controller
            name="content"
            control={control}
            render={({ field: { onChange, onBlur, value } }: any) => (
              <FormControl size="lg" isInvalid={!!errors.content}>
                <Input size="md" className="rounded-2xl bg-primary-100">
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
            )}
          />
        </VStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;
