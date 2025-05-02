import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { Plus } from 'lucide-react-native';
import { TouchableOpacity, FlatList, RefreshControl, SafeAreaView, View } from 'react-native';
import { fetchChats, fetchOnlineUsers } from '@/api';
import { useAuth } from '@/components/auth-provider';
import { MainHeader } from '@/components/header';
import PageSpinner from '@/components/page-spinner';
import { useSocket } from '@/components/socket-provider';
import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { imageFormat } from '@/utils/file';
import { ErrorBoundaryAlert } from '@/components/error';

const MessageHeader: React.FC<any> = () => {
  const router = useRouter();
  const { user } = useAuth();
  const userDocumentId = user.documentId;

  const onlineUsersQuery = useInfiniteQuery({
    queryKey: ['users', 'list', 'online'],
    queryFn: fetchOnlineUsers,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 25,
      },
      userDocumentId,
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
          userDocumentId,
        };
      }

      return null;
    },
  });

  const onlineUsers = onlineUsersQuery.isSuccess
    ? _.reduce(
        onlineUsersQuery.data?.pages,
        (result: any, item: any) => [...result, ...item.data],
        [],
      )
    : [];

  const onItemPress = ({ item }: any) => {
    router.push(`/users/${item.documentId}`);
  };

  const onPlusItemPress = () => router.push('/users/user-list');

  const renderItem = ({ item, index }: any) => {
    return (
      <TouchableOpacity onPress={() => onItemPress({ item })} className="mx-2">
        <VStack className="items-center" space="xs">
          <Avatar key={item.id} size="md">
            <AvatarFallbackText>{item.username}</AvatarFallbackText>
            <AvatarImage
              source={{
                uri: imageFormat(item.avatar, 's', 't')?.fullUrl,
              }}
            />
            <AvatarBadge />
          </Avatar>
          <Text size="xs">{item.username}</Text>
        </VStack>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View className="flex-1 items-center justify-center">
      <Text>没有其他人在线</Text>
    </View>
  );

  const renderHeader = (props: any) => {
    return (
      <VStack className="items-center justify-center" space="xs">
        <Button
          onPress={onPlusItemPress}
          variant="outline"
          action="secondary"
          className="mr-2 h-[42] w-[42] rounded-full">
          <ButtonIcon as={Plus} />
        </Button>
      </VStack>
    );
  };

  return (
    <VStack space="xl" className="mb-4">
      <MainHeader />
      <HStack className="">
        <Card size="sm" className="flex-1 px-4">
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
      </HStack>
    </VStack>
  );
};

const Message: React.FC = () => {
  const { user } = useAuth();
  const { messages: newMessages } = useSocket();
  const router = useRouter();

  const messageQuery = useInfiniteQuery({
    queryKey: ['chats', 'list'],
    queryFn: fetchChats,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 20,
      },
      documentId: user.documentId,
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
          documentId: user.documentId,
        };
      }

      return null;
    },
    staleTime: 0,
  });

  const messages: any = messageQuery.isSuccess
    ? _.reduce(
        messageQuery.data.pages,
        (result: any, page: any) => {
          return [
            ...result,
            ...page.data.map((item: any) => {
              const message = _.find(newMessages, { chat: { id: item.id } });
              return message
                ? { ...item, lastMessage: message, createdAt: message.createdAt }
                : { ...item };
            }),
          ];
        },
        [],
      )
    : [];

  const onItemPressed = ({ item }: any) => router.push(`/chat/${item.documentId}`);

  const renderListItem = ({ item, index }: any) => {
    const otherUser: any = _.find(item.users, (item: any) => item.id !== user.id);

    return (
      <TouchableOpacity onPress={() => onItemPressed({ item, index })}>
        {item.lastMessage ? (
          <HStack space="sm" className="w-full rounded-lg py-2">
            <Avatar>
              {otherUser.avatar ? (
                <AvatarImage
                  source={{
                    uri: imageFormat(otherUser.avatar, 's', 't')?.fullUrl,
                  }}
                />
              ) : (
                <AvatarFallbackText>{otherUser.username}</AvatarFallbackText>
              )}
            </Avatar>
            <VStack space="xs" className="flex-1">
              <HStack className="items-center justify-between">
                <Text bold={true}>{otherUser.username}</Text>
                <Text size="xs">
                  {item.lastMessage.createdAt &&
                    format(item.lastMessage.createdAt, 'yyyy-MM-dd HH:mm:ss')}
                </Text>
              </HStack>
              <HStack className="items-center justify-between">
                <Text className="w-2/3" size="sm" numberOfLines={1} ellipsizeMode="tail">
                  {item.lastMessage?.content}
                </Text>
                {item.chatStatuses[0]?.unreadCount > 0 && (
                  <View className="h-4 w-4 items-center justify-center self-end rounded-full bg-success-600 p-[0.5]">
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      className="text-[8px] leading-none text-white">
                      {item.chatStatuses[0]?.unreadCount}
                    </Text>
                  </View>
                )}
              </HStack>
            </VStack>
          </HStack>
        ) : (
          <HStack space="sm" className="w-full items-center rounded-lg py-2">
            <Avatar>
              {otherUser.avatar ? (
                <AvatarImage
                  source={{
                    uri: imageFormat(otherUser.avatar, 's', 't')?.fullUrl,
                  }}
                />
              ) : (
                <AvatarFallbackText>{otherUser.username}</AvatarFallbackText>
              )}
            </Avatar>
            <Text size="md" bold={true}>
              {otherUser.username}
            </Text>
          </HStack>
        )}
      </TouchableOpacity>
    );
  };

  const renderItemSeparator = (props: any) => <Divider {...props} />;

  const renderEmptyComponent = () => {
    return (
      <View className="mt-32 flex-1 items-center">
        <Text size="sm">暂无消息</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <PageSpinner isVisiable={messageQuery.isLoading} />
      <VStack className="flex-1 px-4">
        <MessageHeader />
        <FlatList
          contentContainerClassName="flex-grow"
          data={messages}
          renderItem={renderListItem}
          ListEmptyComponent={renderEmptyComponent}
          ItemSeparatorComponent={renderItemSeparator}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (messageQuery.hasNextPage && !messageQuery.isFetchingNextPage) {
              messageQuery.fetchNextPage();
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={messageQuery.isLoading}
              onRefresh={() => {
                if (!messageQuery.isLoading) {
                  messageQuery.refetch();
                }
              }}
            />
          }
        />
      </VStack>
    </SafeAreaView>
  );
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <ErrorBoundaryAlert error={error} retry={retry} />
);

export default Message;
