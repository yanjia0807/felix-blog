import React, { useCallback, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import { Ellipsis } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { FlatList } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { z } from 'zod';
import { PageFallbackUI } from '@/components/fallback';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useCreateMessage } from '@/features/chat/api/use-create-message';
import { useFetchChat } from '@/features/chat/api/use-fetch-chat';
import { useFetchChatMessages } from '@/features/chat/api/use-fetch-chat-messages';
import { useListenMessage } from '@/features/chat/api/use-listen-message';
import { useUpdateChatStatus } from '@/features/chat/api/use-update-chat-status';
import { MessageInput } from '@/features/chat/components/message-input';
import { ReceiverItem } from '@/features/chat/components/receiver-item';
import { SenderItem } from '@/features/chat/components/sender-item';
import { UserChatAvatar } from '@/features/user/components/user-chat-avatar';
import useToast from '@/hooks/use-custom-toast';

type MessageFormSchema = z.infer<typeof messageFormSchema>;

const messageFormSchema = z.object({
  content: z.string().min(1, '内容不能为空').max(100, '内容不能多余5000个字符'),
});

const ChatPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { documentId }: any = useLocalSearchParams();

  const flatListRef = useRef<FlatList>(null);
  const toast = useToast();

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

  const chatQuery = useFetchChat({ documentId, userDocumentId: currentUser.documentId });

  const updateChatStatusMutation = useUpdateChatStatus();

  const createMessageMutate = useCreateMessage({ documentId });

  const chatMessageQuery = useFetchChatMessages({ chatDocumentId: documentId });

  const otherUser = chatQuery.isSuccess
    ? _.find(chatQuery.data.users, (item: any) => item.documentId !== currentUser.documentId)
    : null;

  const messages = _.flatMap(chatMessageQuery.data?.pages, (page) => page.data);

  const onSubmit = useCallback(
    ({ content }: MessageFormSchema) => {
      const data = {
        chat: documentId,
        sender: currentUser.documentId,
        receiver: otherUser.documentId,
        content,
      };
      createMessageMutate.mutate(data, {
        onSuccess(data, variables, context) {
          flatListRef.current?.scrollToIndex({ index: 0, animated: true });
          reset();
        },
        onError(error, variables, context) {
          toast.error({ description: error.message });
        },
      });
    },
    [createMessageMutate, currentUser.documentId, documentId, otherUser?.documentId, reset, toast],
  );

  const renderHeaderLeft = () => (
    <HStack className="items-center" space="xl">
      <Button action="secondary" variant="link" onPress={() => router.back()}>
        <ButtonText>返回</ButtonText>
      </Button>
      <UserChatAvatar user={otherUser} />
    </HStack>
  );

  const renderHeaderRight = () => <Icon as={Ellipsis} />;

  const renderMessageItem = ({ item }: any) =>
    item.sender.documentId === currentUser.documentId
      ? renderSenderItem({ item })
      : renderReceiverItem({ item });

  const renderSenderItem = useCallback(({ item }: any) => <SenderItem item={item} />, []);

  const renderReceiverItem = useCallback(
    ({ item }: any) => <ReceiverItem item={item} otherUser={otherUser} />,
    [otherUser],
  );

  const renderInput = useCallback(
    ({ field: { onChange, onBlur, value } }: any) => (
      <MessageInput
        isInvalid={!!errors.content}
        onBlur={onBlur}
        onChangeText={onChange}
        value={value}
        onSubmitEditing={handleSubmit(onSubmit)}
      />
    ),
    [errors.content, handleSubmit, onSubmit],
  );

  const onEndReached = () => {
    if (chatMessageQuery.hasNextPage && !chatMessageQuery.isFetchingNextPage) {
      chatMessageQuery.fetchNextPage();
    }
  };

  useListenMessage({ documentId });

  useEffect(() => {
    return () => {
      if (chatQuery.isSuccess) {
        updateChatStatusMutation.mutate(
          {
            documentId: chatQuery.data.chatStatuses[0].documentId,
          },
          {
            onError(error, variables, context) {
              toast.error({ description: error.message });
            },
          },
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatQuery.isSuccess]);

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
          data={messages}
          inverted={true}
          initialNumToRender={10}
          keyExtractor={(item: any) => item.documentId}
          renderItem={renderMessageItem}
          onEndReached={onEndReached}
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
