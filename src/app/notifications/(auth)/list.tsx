import React from 'react';
import { router, Stack } from 'expo-router';
import _ from 'lodash';
import { PageFallbackUI } from '@/components/fallback';
import ListEmptyView from '@/components/list-empty-view';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { FlatList } from '@/components/ui/flat-list';
import { RefreshControl } from '@/components/ui/refresh-control';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import {
  useFetchNotifications,
  useUpdateFriendRequestNotificationMutation,
  useUpdateNotificationState,
} from '@/features/notification/api';
import { useListenNotification } from '@/features/notification/api/use-listen-notification';
import { FollowItem } from '@/features/notification/components/follow-item';
import { FriendCancelItem } from '@/features/notification/components/friend-cancel-item';
import { FriendFeedBackItem } from '@/features/notification/components/friend-feedback-item';
import { FriendRequestItem } from '@/features/notification/components/friend-request-item';

const NotificationListPage: React.FC = () => {
  const { user } = useAuth();

  const notificationQuery = useFetchNotifications({
    userDocumentId: user.documentId,
  });

  const notifications: any = _.flatMap(notificationQuery.data?.pages, (page) => page.data);

  const updateNotificationMutation = useUpdateNotificationState();

  const updateFriendRequestMutation = useUpdateFriendRequestNotificationMutation();

  const renderHeaderLeft = () => (
    <Button
      action="secondary"
      variant="link"
      onPress={() => {
        router.back();
      }}>
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

  const renderFollowItem = ({ item }: any) => (
    <FollowItem item={item} onPress={() => onItemPress({ item })} />
  );

  const renderFriendRequestItem = ({ item }: any) => (
    <FriendRequestItem
      item={item}
      onPress={() => onItemPress({ item })}
      onFrinedRequestAccept={onFrinedRequestAccept}
      onFrinedRequestReject={onFrinedRequestReject}
    />
  );

  const renderFriendFeedbackItem = ({ item }: any) => (
    <FriendFeedBackItem item={item} onPress={() => onItemPress({ item })} />
  );

  const renderFriendCancelItem = ({ item }: any) => (
    <FriendCancelItem item={item} onPress={() => onItemPress({ item })} />
  );

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

  const renderEmptyComponent = <ListEmptyView text="暂无通知" />;

  const renderItemSeparator = (props: any) => <Divider {...props} />;

  const onEndReached = () => {
    if (notificationQuery.hasNextPage && !notificationQuery.isFetchingNextPage) {
      notificationQuery.fetchNextPage();
    }
  };

  useListenNotification();

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

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default NotificationListPage;
