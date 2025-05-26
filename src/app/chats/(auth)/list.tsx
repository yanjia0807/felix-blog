import React, { useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { FlatList, RefreshControl, SafeAreaView, TouchableOpacity } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated from 'react-native-reanimated';
import { PageFallbackUI } from '@/components/fallback';
import { MainHeader } from '@/components/header';
import { ListEmptyView } from '@/components/list-empty-view';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useDeleteChat } from '@/features/chat/api/use-delete-chat';
import { useFetchChats } from '@/features/chat/api/use-fetch-chats';
import ChatItem from '@/features/chat/components/chat-item';
import { ChatListSkeleton } from '@/features/chat/components/chat-list-skeleton';
import ChatMessageItem from '@/features/chat/components/chat-message-item';
import useToast from '@/hooks/use-toast';

const ChatListHeader: React.FC<any> = () => {
  return (
    <VStack space="xl" className="mb-4">
      <MainHeader />
    </VStack>
  );
};

const ChatList: React.FC<any> = ({ chatsQuery }) => {
  const toast = useToast();
  const router = useRouter();
  const rowRefs = useRef(new Map());
  const { user } = useAuth();

  const chats: any = _.flatMap(chatsQuery.data?.pages, (page) => page.data);

  const deleteMutation = useDeleteChat();

  const onDeleteBtnPress = ({ item }: any) => {
    toast.confirm({
      description: `确认要删除吗？`,
      onConfirm: async () => {
        deleteMutation.mutate(
          {
            documentId: item.documentId,
          },
          {
            onSuccess: () => {
              toast.success({
                description: '删除成功',
              });
            },
            onError(error) {
              toast.error({ description: error.message });
            },
          },
        );
      },
    });
  };

  const renderRightAction = ({ item }: any) => {
    return (
      <Reanimated.View>
        <HStack className="h-full">
          <Button
            size="sm"
            className="h-full rounded-bl-none rounded-tl-none"
            action="negative"
            onPress={() => onDeleteBtnPress({ item })}>
            <ButtonText>删除</ButtonText>
          </Button>
        </HStack>
      </Reanimated.View>
    );
  };

  const onItemPress = (item) => router.push(`/chats/${item.documentId}`);

  const renderItem = ({ item }: any) => {
    const otherUser: any = _.find(item.users, (item: any) => item.id !== user.id);

    return (
      <TouchableOpacity onPress={() => onItemPress(item)}>
        <ReanimatedSwipeable
          renderRightActions={() => renderRightAction({ item })}
          ref={(ref) => {
            if (ref && !rowRefs.current.get(item.id)) {
              rowRefs.current.set(item.id, ref);
            }
          }}
          onSwipeableWillOpen={() => {
            [...rowRefs.current.entries()].forEach(([key, ref]) => {
              if (key !== item.id && ref) ref.close();
            });
          }}>
          {_.isNil(item.lastMessage) ? (
            <ChatItem otherUser={otherUser} item={item} />
          ) : (
            <ChatMessageItem otherUser={otherUser} item={item} />
          )}
        </ReanimatedSwipeable>
      </TouchableOpacity>
    );
  };

  const renderListHeader = useCallback(() => <ChatListHeader />, []);

  const renderItemSeparator = () => <Divider />;

  const renderEmptyComponent = () => <ListEmptyView text="暂无消息" />;

  const onEndReached = () => {
    if (chatsQuery.hasNextPage && !chatsQuery.isFetchingNextPage) {
      chatsQuery.fetchNextPage();
    }
  };

  return (
    <FlatList
      contentContainerClassName="flex-grow"
      data={chats}
      ListHeaderComponent={renderListHeader}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyComponent}
      ItemSeparatorComponent={renderItemSeparator}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      refreshControl={
        <RefreshControl
          refreshing={chatsQuery.isLoading}
          onRefresh={() => {
            if (!chatsQuery.isLoading) chatsQuery.refetch();
          }}
        />
      }
    />
  );
};

const ChatListPage: React.FC = () => {
  const { user } = useAuth();
  const chatsQuery = useFetchChats({ userDocumentId: user.documentId });

  return (
    <SafeAreaView className="flex-1">
      <VStack className="flex-1 px-4">
        {chatsQuery.isSuccess && <ChatList chatsQuery={chatsQuery} />}
        {chatsQuery.isLoading && <ChatListSkeleton />}
      </VStack>
    </SafeAreaView>
  );
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default ChatListPage;
