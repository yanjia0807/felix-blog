import { ListEmptyView } from '@/components/list-empty-view';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { FlatList } from '@/components/ui/flat-list';
import { RefreshControl } from '@/components/ui/refresh-control';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useFetchNotificationCount } from '@/features/notification/api/use-fetch-notification-count';
import { useFetchNotifications } from '@/features/notification/api/use-fetch-notifications';
import { useUpdateFriendRequestNotificationMutation } from '@/features/notification/api/use-update-friend-request-notification';
import { useUpdateNotificationReadState } from '@/features/notification/api/use-update-notification-read-state';
import { useUpdateNotificationsReadState } from '@/features/notification/api/use-update-notifications-read-state';
import { FollowItem } from '@/features/notification/components/follow-item';
import { FriendCancelItem } from '@/features/notification/components/friend-cancel-item';
import { FriendFeedBackItem } from '@/features/notification/components/friend-feedback-item';
import { FriendRequestItem } from '@/features/notification/components/friend-request-item';
import { router, Stack } from 'expo-router';
import _ from 'lodash';
import { Eraser } from 'lucide-react-native';
import React from 'react';

const NotificationListPage: React.FC = () => {
  const { user } = useAuth();

  const notificationQuery = useFetchNotifications({
    userDocumentId: user.documentId,
  });

  const notificationCountQuery = useFetchNotificationCount({ enabled: !!user });

  const notifications: any = _.flatMap(notificationQuery.data?.pages, (page) => page.data);

  const updateNotificationReadStateMutation = useUpdateNotificationReadState();

  const updateNotificationsReadStateMutation = useUpdateNotificationsReadState();

  const updateFriendRequestMutation = useUpdateFriendRequestNotificationMutation();

  const onItemPress = ({ item }: any) => {
    if (item.state === 'unread') {
      updateNotificationReadStateMutation.mutate({
        documentId: item.documentId,
        data: { state: 'read' },
      });
    }
  };

  const onAllReadPress = () => {
    updateNotificationsReadStateMutation.mutate();
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

  const onEndReached = () => {
    if (notificationQuery.hasNextPage && !notificationQuery.isFetchingNextPage) {
      notificationQuery.fetchNextPage();
    }
  };

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

  const renderHeaderRight = () => (
    <Button size="sm" variant="link" onPress={() => onAllReadPress()}>
      <ButtonIcon as={Eraser} />
      <ButtonText>全部已读({notificationCountQuery.data})</ButtonText>
    </Button>
  );

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

  return (
    <>
      <Stack.Screen
        options={{
          title: '通知中心',
          headerShown: true,
          headerLeft: renderHeaderLeft,
          headerRight: renderHeaderRight,
        }}
      />
      <SafeAreaView className="flex-1">
        <VStack className="flex-1 p-4">
          <FlatList
            data={notifications}
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

export default NotificationListPage;
