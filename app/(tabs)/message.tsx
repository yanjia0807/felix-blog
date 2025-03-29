import React from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Stack, useRouter } from 'expo-router';
import _ from 'lodash';
import { Plus } from 'lucide-react-native';
import { FlatList, RefreshControl, SafeAreaView, TouchableOpacity } from 'react-native';
import { fetchChats, fetchFriends } from '@/api';
import { useAuth } from '@/components/auth-provider';
import { MainHeader } from '@/components/header';
import PageSpinner from '@/components/page-spinner';
import { useSocket } from '@/components/socket-context';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { thumbnailSize } from '@/utils/file';

const ChatListHeader: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const friendQuery = useQuery({
    queryKey: ['friends', 'list'],
    queryFn: fetchFriends,
  });

  const friends: any = friendQuery.isSuccess ? friendQuery.data : [];

  const onItemPress = ({ item }: any) => router.push(`/users/${item.documentId}`);

  const onPlusItemPress = () => router.push('/users/user-list');

  const renderFriendItem = ({ item, index }: any) => {
    return (
      <TouchableOpacity onPress={() => onItemPress({ item })} className="mx-2">
        <VStack className="items-center" space="xs">
          <Avatar key={item.id} size="md">
            <AvatarFallbackText>{item.username}</AvatarFallbackText>
            <AvatarImage
              source={{
                uri: thumbnailSize(item),
              }}
            />
          </Avatar>
        </VStack>
      </TouchableOpacity>
    );
  };

  const renderFriendHeader = (props: any) => {
    return (
      <Button
        onPress={onPlusItemPress}
        variant="outline"
        action="secondary"
        className="mr-2 h-[42] w-[42] rounded-full">
        <ButtonIcon as={Plus} />
      </Button>
    );
  };

  return (
    <VStack space="xl" className="mb-10">
      <MainHeader />
      <Card variant="elevated" size="sm" className="rounded-lg">
        <VStack space="md">
          <Heading size="sm">在线好友</Heading>
          <FlatList
            data={friends}
            contentContainerClassName="flex-1"
            ListHeaderComponent={renderFriendHeader}
            renderItem={renderFriendItem}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        </VStack>
      </Card>
    </VStack>
  );
};

const ChatList: React.FC = () => {
  const { user }: any = useAuth();
  const { messages: newMessages } = useSocket();
  const router = useRouter();

  const { data, fetchNextPage, hasNextPage, isLoading, isSuccess, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['chats', 'list'],
      queryFn: fetchChats,
      enabled: !!user,
      initialPageParam: {
        pagination: {
          page: 1,
          pageSize: 20,
        },
        documentId: user?.documentId,
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
  const chats: any = isSuccess
    ? _.reduce(
        data.pages,
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

  const renderListHeader = (props: any) => <ChatListHeader {...props} />;

  const onChatItemPressed = ({ item }: any) => router.push(`/chat/${item.documentId}`);

  const renderItem = ({ item, index }: any) => {
    const otherUser: any = _.find(item.users, (item: any) => item.id !== user.id);

    return (
      <TouchableOpacity onPress={() => onChatItemPressed({ item, index })}>
        {item.lastMessage ? (
          <HStack space="sm" className="w-full rounded-lg py-2">
            <Avatar>
              <AvatarFallbackText>{otherUser.username}</AvatarFallbackText>
              <AvatarImage
                source={{
                  uri: thumbnailSize(otherUser.avatar),
                }}
              />
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
                  <Box className="h-4 w-4 items-center justify-center self-end rounded-full bg-success-600 p-[0.5]">
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      className="text-[8px] leading-none text-white">
                      {item.chatStatuses[0]?.unreadCount}
                    </Text>
                  </Box>
                )}
              </HStack>
            </VStack>
          </HStack>
        ) : (
          <HStack space="sm" className="w-full items-center rounded-lg py-2">
            <Avatar>
              <AvatarFallbackText>{otherUser.username}</AvatarFallbackText>
              <AvatarImage
                source={{
                  uri: thumbnailSize(otherUser.avatar),
                }}
              />
            </Avatar>
            <Text size="md" bold={true}>
              {otherUser.username}
            </Text>
          </HStack>
        )}
      </TouchableOpacity>
    );
  };

  const renderItemSeparator = (props: any) => <Divider {...props} className="my-2" />;

  const renderEmptyComponent = (props: any) => {
    return (
      <Box className="mt-10 w-full items-center justify-center">
        <Text size="sm">暂无消息</Text>
      </Box>
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <PageSpinner isVisiable={isLoading} />
      <VStack className="flex-1 px-4">
        <FlatList
          data={chats}
          ListHeaderComponent={renderListHeader}
          renderItem={renderItem}
          columnWrapperClassName=""
          ItemSeparatorComponent={renderItemSeparator}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {
                if (!isLoading) {
                  refetch();
                }
              }}
            />
          }
        />
      </VStack>
    </SafeAreaView>
  );
};

const ChatListPage = () => {
  return <ChatList />;
};

export default ChatListPage;
