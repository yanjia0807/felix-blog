import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useFetchChat } from '@/features/chat/api/use-fetch-chat';
import { useFetchChatMessages } from '@/features/chat/api/use-fetch-chat-messages';
import { useUpdateChatStatus } from '@/features/chat/api/use-update-chat-status';
import { ChatDetailSkeleton } from '@/features/chat/components/chat-detail-skeleton';
import { MessageInput } from '@/features/chat/components/message-input';
import { ReceiverItem } from '@/features/chat/components/receiver-item';
import { SenderItem } from '@/features/chat/components/sender-item';
import { UserChatAvatar } from '@/features/user/components/user-chat-avatar';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import { Ellipsis } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import { FlatList } from 'react-native';

const ChatDetail: React.FC<any> = () => {
  const { documentId }: any = useLocalSearchParams();
  const { user: currentUser } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const chatQuery = useFetchChat({ documentId, userDocumentId: currentUser.documentId });

  const otherUser = _.find(
    chatQuery.data?.users,
    (item: any) => item.documentId !== currentUser.documentId,
  );

  const isBlock = _.some(currentUser?.blockUsers, ['documentId', otherUser?.documentId]);

  const chatMessageQuery = useFetchChatMessages({ chatDocumentId: documentId });
  const messages = _.flatMap(chatMessageQuery.data?.pages, (page) => page.data);

  const { mutate: updateChatStatus } = useUpdateChatStatus();

  const onEndReached = () => {
    if (chatMessageQuery.hasNextPage && !chatMessageQuery.isFetchingNextPage) {
      chatMessageQuery.fetchNextPage();
    }
  };

  const successCb = useCallback(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToIndex({ index: 0, animated: true });
    }
  }, [messages.length]);

  const renderHeaderLeft = () => (
    <HStack className="items-center" space="xl">
      <Button action="secondary" variant="link" onPress={() => router.back()}>
        <ButtonText>返回</ButtonText>
      </Button>
      <UserChatAvatar user={otherUser} />
    </HStack>
  );

  const renderHeaderRight = () => <Icon as={Ellipsis} />;

  const renderItem = ({ item }: any) =>
    item.sender.documentId === currentUser.documentId
      ? renderSenderItem({ item })
      : renderReceiverItem({ item });

  const renderSenderItem = useCallback(({ item }: any) => <SenderItem item={item} />, []);

  const renderReceiverItem = useCallback(
    ({ item }: any) => <ReceiverItem item={item} otherUser={otherUser} />,
    [otherUser],
  );

  useEffect(() => {
    return () => {
      updateChatStatus(
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
  }, [chatQuery.data, updateChatStatus]);

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
            contentContainerClassName="flex-grow justify-end pt-10"
            ref={flatListRef}
            data={messages}
            inverted={true}
            initialNumToRender={10}
            keyExtractor={(item: any) => item.documentId}
            renderItem={renderItem}
            onEndReached={onEndReached}
          />
          <MessageInput
            chatDocumentId={documentId}
            sender={currentUser.documentId}
            receiver={otherUser.documentId}
            isBlock={isBlock}
            successCb={successCb}
          />
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
