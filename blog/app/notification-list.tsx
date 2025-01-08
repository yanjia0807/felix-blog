import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { router, Stack } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { apiServerURL, fetchNotifications, updateNotificationState } from '@/api';
import { useAuth } from '@/components/auth-context';
import { useSocket } from '@/components/socket-context';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
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
  const queryClient = useQueryClient();
  const { notifications: newNotifications, setNotifications } = useSocket();

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['notifications', 'list'],
      queryFn: fetchNotifications,
      initialPageParam: {
        pagination: {
          page: 1,
          pageSize: 5,
        },
        filters: {
          userDocumentId: user.documentId,
          excludeDocumentIds: _.map(newNotifications, 'documentId'),
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
              userDocumentId: user.documentId,
              excludeDocumentIds: _.map(newNotifications, 'documentId'),
            },
          };
        }

        return null;
      },
      staleTime: Infinity,
    });

  const notifications: any = _.concat(
    [...newNotifications],
    _.reduce(data?.pages, (result: any, page: any) => [...result, ...page.data], []),
  );

  const { mutate } = useMutation({
    mutationFn: updateNotificationState,
    onSuccess: (data, variables, context) => {
      if (_.some(newNotifications, { id: data.id })) {
        setNotifications((oldValue: any) =>
          oldValue.map((oldItem: any) => (oldItem.id === data.id ? { ...data } : { ...oldItem })),
        );
      } else {
        queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
        queryClient.setQueryData(['notifications', 'list'], (oldData: any) => {
          return {
            ...oldData,
            pages: _.map(oldData.pages, (page: any) => ({
              ...page,
              data: page.data.map((item: any) =>
                item.documentId === data.documentId ? { ...data } : { ...item },
              ),
            })),
          };
        });
      }
    },
  });

  const renderHeaderLeft = () => (
    <Button
      action="secondary"
      variant="link"
      onPress={() => {
        router.back();
      }}>
      <ButtonIcon as={ChevronLeft} />
      <ButtonText>返回</ButtonText>
    </Button>
  );

  const onNotificationItemPressed = ({ item }: any) => {
    if (item.state === 'unread') {
      mutate({ documentId: item.documentId, data: { state: 'read' } });
    }
  };

  const renderFollowNotificationItem = ({ item, index }: any) => {
    return (
      <Pressable onPress={() => onNotificationItemPressed({ item })}>
        <Card variant="elevated" className="my-6 w-full rounded-lg" size="lg">
          {item.state === 'unread' && (
            <Box className="absolute right-0 top-0 m-4 h-3 w-3 rounded-full bg-green-400" />
          )}
          <VStack space="md">
            <Text size="sm">{format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}</Text>
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
        <VStack className="flex-1 px-4">
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
