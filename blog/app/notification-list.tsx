import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft } from 'lucide-react-native';
import moment from 'moment';
import React, { useEffect } from 'react';
import { apiServerURL, fetchNotifications } from '@/api';
import { useAuth } from '@/components/auth-context';
import { useSocket } from '@/components/socket-context';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FlatList } from '@/components/ui/flat-list';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { RefreshControl } from '@/components/ui/refresh-control';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const NotificationList = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['notifications', 'me'],
      queryFn: fetchNotifications,
      initialPageParam: {
        pagination: {
          page: 1,
          pageSize: 5,
        },
        filters: {
          user: user.documentId,
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
              user: user.documentId,
            },
          };
        }

        return null;
      },
      staleTime: Infinity,
    });

  useEffect(() => {
    socket.on('notification:create', ({ data: newNotification }: any) => {
      queryClient.setQueryData(['notifications', 'me'], (oldData: any) => {
        const updatedPages = [...oldData.pages];
        updatedPages[0].data.unshift(newNotification);
        return updatedPages;
      });
    });
    return () => {
      socket.off('notification:create');
    };
  }, [queryClient]);

  const notifications: any = _.reduce(
    data?.pages,
    (result: any, item: any) => [...result, ...item.data],
    [],
  );

  const renderHeaderLeft = () => (
    <Button
      variant="link"
      onPress={() => {
        router.back();
      }}>
      <ButtonIcon as={ChevronLeft} />
    </Button>
  );

  const onFollowNotificationItemPressed = ({ item }: any) => {
    if (item.state === 'unread') {
    }
  };

  const renderFollowNotificationItem = ({ item, index }: any) => {
    return (
      <Pressable onPress={() => onFollowNotificationItemPressed({ item })}>
        <Card variant="elevated" className="my-6 w-full rounded-lg" size="lg">
          {item.state === 'unread' && (
            <Box className="absolute right-0 top-0 m-4 h-3 w-3 rounded-full bg-green-400" />
          )}
          <VStack space="md">
            <Text size="sm">{moment(item.createdAt).format('YYYY-MM-DD HH:mm')}</Text>
            <HStack className="w-full items-center" space="4xl">
              <HStack className="flex-1 items-center" space="md">
                <Avatar size="lg">
                  <AvatarImage
                    source={{
                      uri: `${apiServerURL}/${item.metaData.follower.avatar?.formats.thumbnail.url}`,
                    }}
                  />
                </Avatar>
                <VStack className="flex-1 justify-between" space="sm">
                  <Text size="md" bold={true}>
                    {item.metaData.follower.username}
                  </Text>
                  <Text size="sm" numberOfLines={2}>
                    {item.metaData.follower.bio}
                  </Text>
                </VStack>
              </HStack>
              <HStack className="items-center" space="md">
                <Text>关注了你</Text>
              </HStack>
            </HStack>
          </VStack>
        </Card>
      </Pressable>
    );
  };

  const renderDefaultNotificationItem = ({ item, index }: any) => {
    return <></>;
  };

  const renderItem = ({ item, index }: any) => {
    switch (item.type) {
      case 'follow':
        return renderFollowNotificationItem({ item, index });
      default:
        return renderDefaultNotificationItem({ item, index });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '通知中心',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <SafeAreaView className="flex-1">
        <VStack className="flex-1 px-6">
          <FlatList
            data={notifications}
            renderItem={renderItem}
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
    </>
  );
};

export default NotificationList;
