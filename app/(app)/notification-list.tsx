import React from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { router, Stack } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import {
  fetchNotifications,
  updateFriendRequestNotification,
  updateNotificationState,
} from '@/api';
import { useAuth } from '@/components/auth-provider';
import { PageFallbackUI } from '@/components/fallback';
import { useSocket } from '@/components/socket-provider';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { FlatList } from '@/components/ui/flat-list';
import { HStack } from '@/components/ui/hstack';
import { RefreshControl } from '@/components/ui/refresh-control';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { UserAvatarNotice } from '@/components/user';
import useToast from '@/hooks/use-custom-toast';

const NotificationList: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { notifications: newNotifications, setNotifications } = useSocket();

  const notificationQuery = useInfiniteQuery({
    queryKey: ['notifications', 'list'],
    queryFn: fetchNotifications,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 20,
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
    _.reduce(
      notificationQuery.data?.pages,
      (result: any, page: any) => [...result, ...page.data],
      [],
    ),
  );

  const updateNotificationMutation = useMutation({
    mutationFn: updateNotificationState,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(['notifications', 'count'], (val: any) => {
        return val - 1;
      });

      if (_.some(newNotifications, { id: data.id })) {
        setNotifications((val: any) =>
          val.map((item: any) => (item.id === data.id ? { ...data } : { ...item })),
        );
      } else {
        queryClient.setQueryData(['notifications', 'list'], (val: any) => {
          return {
            ...val,
            pages: _.map(val.pages, (page: any) => ({
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

  const updateFriendRequestMutation = useMutation({
    mutationFn: ({ documentId, friendRequest, state }: any) => {
      const params = { documentId, friendRequest, state };
      return updateFriendRequestNotification(params);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', 'me'],
      });

      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', { documentId: variables.sender }],
      });

      queryClient.invalidateQueries({
        queryKey: ['friends', 'list'],
      });

      queryClient.invalidateQueries({
        queryKey: ['followings', 'list'],
      });

      queryClient.invalidateQueries({
        queryKey: ['followers', 'list'],
      });

      queryClient.setQueryData(['notifications', 'count'], (val: any) => {
        return val - 1;
      });

      if (_.some(newNotifications, { id: data.id })) {
        setNotifications((val: any) =>
          val.map((item: any) => (item.id === data.id ? { ...data } : { ...item })),
        );
      } else {
        queryClient.setQueryData(['notifications', 'list'], (val: any) => {
          return {
            ...val,
            pages: _.map(val.pages, (page: any) => ({
              ...page,
              data: page.data.map((item: any) =>
                item.documentId === data.documentId ? { ...data } : { ...item },
              ),
            })),
          };
        });
      }
    },
    onError(error) {
      toast.error(error.message);
      console.error(error);
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

  const onItemPress = ({ item }: any) => {
    if (item.state === 'unread') {
      updateNotificationMutation.mutate({ documentId: item.documentId, data: { state: 'read' } });
    }
  };

  const onFrinedRequestAccept = ({ item }: any) => {
    updateFriendRequestMutation.mutate({
      documentId: item.documentId,
      friendRequest: item.data.friendRequest.documentId,
      sender: item.data.friendRequest.sender.documentId,
      state: 'accepted',
    });
  };

  const onFrinedRequestReject = ({ item }: any) => {
    updateFriendRequestMutation.mutate({
      documentId: item.documentId,
      friendRequest: item.data.friendRequest.documentId,
      sender: item.data.friendRequest.sender.documentId,
      state: 'rejected',
    });
  };

  const renderFollowItem = ({ item, index }: any) => {
    return (
      <TouchableOpacity onPress={() => onItemPress({ item })}>
        <Card variant="ghost">
          <VStack space="md">
            <HStack className="items-center justify-between">
              <Text size="sm">{format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}</Text>
              {item.state === 'unread' ? (
                <View className="h-3 w-3 rounded-full bg-success-400" />
              ) : (
                <View />
              )}
            </HStack>
            <HStack className="items-center justify-between">
              <UserAvatarNotice user={item.data.follower} />
              <Text>{item.data.isFollowing ? '关注了你' : '取消了关注你'}</Text>
            </HStack>
          </VStack>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderFriendRequestItem = ({ item, index }: any) => {
    return (
      <TouchableOpacity onPress={() => onItemPress({ item })}>
        <Card variant="ghost">
          <VStack space="md">
            <HStack className="items-center justify-between">
              <Text size="sm">{format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}</Text>
              {item.state === 'unread' ? (
                <View className="h-3 w-3 rounded-full bg-success-400" />
              ) : (
                <View />
              )}
            </HStack>
            <HStack className="items-center justify-between">
              <UserAvatarNotice user={item.data.friendRequest.sender} />
              <Text>
                {!item.feedback
                  ? '申请添加你为好友'
                  : item.feedback.state === 'accepted'
                    ? '已同意添加好友'
                    : '已拒绝添加好友'}
              </Text>
            </HStack>
            {!item.feedback && (
              <HStack className="item-center justify-end" space="sm">
                <Button
                  variant="link"
                  action="positive"
                  size="sm"
                  onPress={() => onFrinedRequestAccept({ item })}>
                  <ButtonText>同意</ButtonText>
                </Button>
                <Button
                  variant="link"
                  action="negative"
                  size="sm"
                  onPress={() => onFrinedRequestReject({ item })}>
                  <ButtonText>拒绝</ButtonText>
                </Button>
              </HStack>
            )}
          </VStack>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderFriendFeedbackItem = ({ item, index }: any) => {
    return (
      <TouchableOpacity onPress={() => onItemPress({ item })}>
        <Card variant="ghost">
          <VStack space="md">
            <HStack className="items-center justify-between">
              <Text size="sm">{format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}</Text>
              {item.state === 'unread' ? (
                <View className="h-3 w-3 rounded-full bg-success-400" />
              ) : (
                <View />
              )}
            </HStack>
            <HStack className="items-center justify-between">
              <UserAvatarNotice user={item.data.friendRequest.receiver} />
              <Text>
                {item.data.friendRequest.state === 'accepted' ? '已同意添加好友' : '已拒绝添加好友'}
              </Text>
            </HStack>
          </VStack>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderFriendCancelItem = ({ item, index }: any) => {
    return (
      <TouchableOpacity onPress={() => onItemPress({ item })}>
        <Card variant="ghost">
          <VStack space="md">
            <HStack className="items-center justify-between">
              <Text size="sm">{format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}</Text>
              {item.state === 'unread' ? (
                <View className="h-3 w-3 rounded-full bg-success-400" />
              ) : (
                <View />
              )}
            </HStack>
            <HStack className="items-center justify-between">
              <UserAvatarNotice user={item.data.user} />
              <Text>删除了好友</Text>
            </HStack>
          </VStack>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderDefaultItem = ({ item, index }: any) => {
    return <></>;
  };

  const renderItem = ({ item, index }: any) => {
    switch (item.type) {
      case 'following':
        return renderFollowItem({ item, index });
      case 'friend-request':
        return renderFriendRequestItem({ item, index });
      case 'friend-feedback':
        return renderFriendFeedbackItem({ item, index });
      case 'friend-cancel':
        return renderFriendCancelItem({ item, index });
      default:
        return renderDefaultItem({ item, index });
    }
  };

  const renderEmptyComponent = (props: any) => {
    return (
      <View className="mt-32 flex-1 items-center">
        <Text size="sm">暂无通知</Text>
      </View>
    );
  };

  const renderItemSeparator = (props: any) => <Divider {...props} />;

  const onEndReached = () => {
    if (notificationQuery.hasNextPage && !notificationQuery.isFetchingNextPage) {
      notificationQuery.fetchNextPage();
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
        <VStack className="flex-1 p-4">
          <FlatList
            data={notifications}
            contentContainerClassName="flex-grow"
            renderItem={renderItem}
            ItemSeparatorComponent={renderItemSeparator}
            ListEmptyComponent={renderEmptyComponent}
            showsVerticalScrollIndicator={false}
            onEndReached={onEndReached}
            refreshControl={
              <RefreshControl
                refreshing={notificationQuery.isLoading}
                onRefresh={() => {
                  if (!notificationQuery.isLoading) {
                    notificationQuery.refetch();
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

const NotificationListPage = () => {
  return <NotificationList />;
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default NotificationListPage;
