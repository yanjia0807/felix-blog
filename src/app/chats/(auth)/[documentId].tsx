import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useCreateMessage } from '@/features/chat/api/use-create-message';
import { useFetchChat } from '@/features/chat/api/use-fetch-chat';
import { useFetchChatMessages } from '@/features/chat/api/use-fetch-chat-messages';
import { useUpdateChatStatus } from '@/features/chat/api/use-update-chat-status';
import { ChatDetailSkeleton } from '@/features/chat/components/chat-detail-skeleton';
import { MessageInput } from '@/features/chat/components/message-input';
import { ReceiverItem } from '@/features/chat/components/receiver-item';
import { SenderItem } from '@/features/chat/components/sender-item';
import { UserChatAvatar } from '@/features/user/components/user-chat-avatar';
import useToast from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import { Ellipsis } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FlatList } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { z } from 'zod';

type MessageFormSchema = z.infer<typeof messageFormSchema>;

const messageFormSchema = z.object({
  content: z.string().min(1, '内容不能为空').max(100, '内容不能多余5000个字符'),
});

const ChatDetail: React.FC<any> = () => {
  const { documentId }: any = useLocalSearchParams();
  const { user: currentUser } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const toast = useToast();

  const chatQuery = useFetchChat({ documentId, userDocumentId: currentUser.documentId });

  const otherUser = _.find(
    chatQuery.data?.users,
    (item: any) => item.documentId !== currentUser.documentId,
  );

  const updateChatStatusMutation = useUpdateChatStatus();
  const createMessageMutate = useCreateMessage({ documentId });
  const chatMessageQuery = useFetchChatMessages({ chatDocumentId: documentId });
  const messages = _.flatMap(chatMessageQuery.data?.pages, (page) => page.data);

  const renderHeaderLeft = () => (
    <HStack className="items-center" space="xl">
      <Button action="secondary" variant="link" onPress={() => router.dismissTo('/chat')}>
        <ButtonText>返回</ButtonText>
      </Button>
      {otherUser && <UserChatAvatar user={otherUser} />}
    </HStack>
  );

  const renderHeaderRight = () => <Icon as={Ellipsis} />;

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

  const onSubmit = useCallback(
    ({ content }: MessageFormSchema) => {
      const data = {
        chat: documentId,
        sender: currentUser.documentId,
        receiver: otherUser.documentId,
        content,
      };
      createMessageMutate.mutate(data, {
        onSuccess() {
          if (messages.length > 0) {
            flatListRef.current?.scrollToIndex({ index: 0, animated: true });
          }
          reset();
        },
        onError(error) {
          toast.error({ description: error.message });
        },
      });
    },
    [
      createMessageMutate,
      currentUser.documentId,
      documentId,
      messages.length,
      otherUser.documentId,
      reset,
    ],
  );

  const onEndReached = () => {
    if (chatMessageQuery.hasNextPage && !chatMessageQuery.isFetchingNextPage) {
      chatMessageQuery.fetchNextPage();
    }
  };

  const renderItem = ({ item }: any) =>
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

  useEffect(() => {
    return () => {
      updateChatStatusMutation.mutate(
        {
          documentId: chatQuery.data?.chatStatuses[0].documentId,
        },
        {
          onError(error, variables, context) {
            console.error(error);
          },
        },
      );
    };
  }, [chatQuery.data, updateChatStatusMutation.mutate]);

  if (chatQuery.data) {
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
        <VStack className="flex-1 justify-between p-4">
          <FlatList
            contentContainerClassName="flex-grow justify-end"
            ref={flatListRef}
            data={messages}
            inverted={true}
            initialNumToRender={10}
            keyExtractor={(item: any) => item.documentId}
            renderItem={renderItem}
            onEndReached={onEndReached}
          />
          <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={100}>
            <HStack>
              <Controller name="content" control={control} render={renderInput} />
            </HStack>
          </KeyboardAvoidingView>
        </VStack>
      </SafeAreaView>
    );
  }

  return <ChatDetailSkeleton />;
};

const ChatDetailLayout: React.FC<any> = () => {
  return <ChatDetail />;
};

export default ChatDetailLayout;
