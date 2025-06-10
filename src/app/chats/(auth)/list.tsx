import { MainHeader } from '@/components/header';
import { ListEmptyView } from '@/components/list-empty-view';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useDeleteChat } from '@/features/chat/api/use-delete-chat';
import { useFetchChats } from '@/features/chat/api/use-fetch-chats';
import ChatItem from '@/features/chat/components/chat-item';
import { ChatListSkeleton } from '@/features/chat/components/chat-list-skeleton';
import ChatMessageItem from '@/features/chat/components/chat-message-item';
import useToast from '@/hooks/use-toast';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import React, { useCallback, useRef } from 'react';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated from 'react-native-reanimated';

const ChatListHeader: React.FC<any> = () => {
  return (
    <VStack space="xl" className="mb-4">
      <MainHeader />
    </VStack>
  );
};

const ChatList: React.FC<any> = () => {
  const toast = useToast();
  const router = useRouter();
  const rowRefs = useRef(new Map());
  const { user } = useAuth();

  const chatsQuery = useFetchChats({ userDocumentId: user.documentId });
  const chats: any = _.flatMap(chatsQuery.data?.pages, (page) => page.data);

  const deleteMutation = useDeleteChat();

  const onDeleteBtnPress = useCallback(
    ({ item }: any) => {
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
    },
    [toast, deleteMutation],
  );

  const renderRightAction = useCallback(
    ({ item }: any) => {
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
    },
    [onDeleteBtnPress],
  );

  const onItemPress = useCallback((item) => router.push(`/chats/${item.documentId}`), [router]);

  const renderItem = useCallback(
    ({ item }: any) => {
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
    },
    [onItemPress, renderRightAction, user.id],
  );

  const renderListHeader = useCallback(() => <ChatListHeader />, []);

  const renderItemSeparator = () => <Divider />;

  const renderEmptyComponent = () => <ListEmptyView text="暂无消息" />;

  const onEndReached = () => {
    if (chatsQuery.hasNextPage && !chatsQuery.isFetchingNextPage) {
      chatsQuery.fetchNextPage();
    }
  };

  if (chatsQuery.data) {
    return (
      <SafeAreaView className="flex-1">
        <VStack className="flex-1 px-4" space="md">
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
        </VStack>
      </SafeAreaView>
    );
  }

  return <ChatListSkeleton />;
};

const ChatListLayout: React.FC = () => {
  return <ChatList />;
};

export default ChatListLayout;
