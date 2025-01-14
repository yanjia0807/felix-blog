import { useInfiniteQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Redirect, Stack, useRouter } from 'expo-router';
import _ from 'lodash';
import React from 'react';
import { FlatList, RefreshControl, SafeAreaView } from 'react-native';
import { apiServerURL, fetchChats } from '@/api';
import { useAuth } from '@/components/auth-context';
import { useSocket } from '@/components/socket-context';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const ChatListHeader = () => {
  const { user }: any = useAuth();
  const router = useRouter();

  const onSearchUserBtnPressed = () => router.push('/search-user-list');

  return (
    <HStack className="mb-4 items-center justify-between">
      <HStack className="items-center" space="sm">
        <Avatar>
          <AvatarImage
            source={{
              uri: `${apiServerURL}/${user.avatar?.formats.thumbnail.url}`,
            }}
          />
        </Avatar>
        <Heading>我的消息</Heading>
      </HStack>
      <Button action="primary" size="md" variant="link" onPress={onSearchUserBtnPressed}>
        <ButtonText>查询用户</ButtonText>
      </Button>
    </HStack>
  );
};

const ChatList = () => {
  const { user }: any = useAuth();
  const { messages: newMessages } = useSocket();
  const router = useRouter();

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, refetch } =
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

  const chats: any = _.reduce(
    data?.pages,
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
  );

  const renderListHeader = (props: any) => {
    return <ChatListHeader {...props} />;
  };

  const onChatItemPressed = ({ item }: any) => {
    router.push({
      pathname: '/chat',
      params: {
        documentId: item.documentId,
      },
    });
  };

  const renderItem = ({ item, index }: any) => {
    const otherUser: any = _.find(item.users, (item: any) => item.id !== user.id);
    return (
      <Pressable onPress={() => onChatItemPressed({ item, index })}>
        {item.lastMessage ? (
          <HStack space="sm" className="w-full rounded-lg py-2">
            <Avatar>
              <AvatarImage
                source={{
                  uri: `${apiServerURL}/${otherUser.avatar?.formats.thumbnail.url}`,
                }}></AvatarImage>
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
                  <Box className="h-5 w-5 items-center justify-center rounded-full bg-success-600">
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      className="text-xs leading-none text-white">
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
              <AvatarImage
                source={{
                  uri: `${apiServerURL}/${otherUser.avatar?.formats.thumbnail.url}`,
                }}></AvatarImage>
            </Avatar>
            <Text size="md" bold={true}>
              {otherUser.username}
            </Text>
          </HStack>
        )}
      </Pressable>
    );
  };

  const renderItemSeparator = (props: any) => <Divider {...props} className="my-2" />;

  return (
    <>
      {user ? (
        <>
          <Stack.Screen
            options={{
              headerShown: false,
            }}
          />
          <SafeAreaView className="flex-1">
            {isLoading ? (
              <Spinner size="small" className="absolute bottom-0 left-0 right-0 top-0" />
            ) : (
              <VStack className="flex-1 px-4">
                <FlatList
                  data={chats}
                  ListHeaderComponent={renderListHeader}
                  renderItem={renderItem}
                  ItemSeparatorComponent={renderItemSeparator}
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
            )}
          </SafeAreaView>
        </>
      ) : (
        <Redirect href="/anonymous" />
      )}
    </>
  );
};

export default ChatList;
