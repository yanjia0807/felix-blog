import React from 'react';
import _ from 'lodash';
import { FlatList, RefreshControl, SafeAreaView, View } from 'react-native';
import { PageFallbackUI } from '@/components/fallback';
import { MainHeader } from '@/components/header';
import ListEmptyView from '@/components/list-empty-view';
import PageSpinner from '@/components/page-spinner';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useFetchChats } from '@/features/chat/api/use-fetch-chats';
import ChatItem from '@/features/chat/components/chat-item';
import ChatMessageItem from '@/features/chat/components/chat-message-item';
import { useFetchOnlineUsers } from '@/features/user/api/use-fetch-online-users';
import { OnlineUserHeader, OnlineUserItem } from '@/features/user/components/online-user-item';
import { useListenMessage } from '@/features/chat/api/use-listen-message';

const ChatListHeader: React.FC<any> = () => {
  const { user } = useAuth();

  const userDocumentId = user.documentId;

  const onlineUsersQuery = useFetchOnlineUsers({ userDocumentId });

  const onlineUsers = _.flatMap(onlineUsersQuery.data?.pages, (page) => page.data);

  const renderHeader = () => <OnlineUserHeader />;

  const renderItem = ({ item }: any) => <OnlineUserItem item={item} />;

  const renderEmptyComponent = () => (
    <View className="flex-1 items-center justify-center">
      <Text>没有其他人在线</Text>
    </View>
  );

  return (
    <VStack space="xl" className="mb-4">
      <MainHeader />
      <Card size="sm" className="px-4">
        <VStack space="md">
          <Text>在线用户</Text>
          <FlatList
            data={onlineUsers}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmptyComponent}
            renderItem={renderItem}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        </VStack>
      </Card>
    </VStack>
  );
};

const ChatList: React.FC = () => {
  const { user } = useAuth();

  const chatQuery = useFetchChats({ userDocumentId: user.documentId });

  const chats: any = _.flatMap(chatQuery.data?.pages, (page) => page.data);

  const renderListItem = ({ item }: any) => {
    const otherUser: any = _.find(item.users, (item: any) => item.id !== user.id);

    return _.isNil(item.lastMessage) ? (
      <ChatItem otherUser={otherUser} item={item} />
    ) : (
      <ChatMessageItem otherUser={otherUser} item={item} />
    );
  };

  const renderItemSeparator = (props: any) => <Divider {...props} />;

  const renderEmptyComponent = () => <ListEmptyView text="暂无消息" />;

  const onEndReached = () => {
    if (chatQuery.hasNextPage && !chatQuery.isFetchingNextPage) {
      chatQuery.fetchNextPage();
    }
  };

  return (
    <SafeAreaView className="flex-1">
      {chatQuery.isLoading && <PageSpinner />}
      <VStack className="flex-1 px-4">
        <ChatListHeader />
        <FlatList
          contentContainerClassName="flex-grow"
          data={chats}
          renderItem={renderListItem}
          ListEmptyComponent={renderEmptyComponent}
          ItemSeparatorComponent={renderItemSeparator}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReached}
          refreshControl={
            <RefreshControl
              refreshing={chatQuery.isLoading}
              onRefresh={() => {
                if (!chatQuery.isLoading) chatQuery.refetch();
              }}
            />
          }
        />
      </VStack>
    </SafeAreaView>
  );
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default ChatList;
