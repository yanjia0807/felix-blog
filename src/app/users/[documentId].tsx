import React, { useState } from 'react';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import {
  Calendar,
  Eye,
  EyeClosed,
  MapPin,
  MessageCircle,
  ScanFace,
  Share2,
  UserRoundMinus,
  UserRoundPlus,
} from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { PageFallbackUI } from '@/components/fallback';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useCreateChat } from '@/features/chat/api/use-create-chat';
import { useFetchChatByUsers } from '@/features/chat/api/use-fetch-chat-by-users';
import { PagerViewProvider } from '@/features/image/components/pager-view-provider';
import PhotoListView from '@/features/post/components/photo-list-view';
import PostListView from '@/features/post/components/post-list-view';
import { useCancelFriend } from '@/features/user/api/use-cancel-friend';
import { useCreateFriendRequestMutation } from '@/features/user/api/use-create-friend-request';
import { useEditFollow } from '@/features/user/api/use-edit-follow';
import { useFetchUser } from '@/features/user/api/use-fetch-user';
import { UserDetailSkeleton } from '@/features/user/components/user-detail-skeleton';
import { UserProfileAvatar } from '@/features/user/components/user-profile-avater';
import useToast from '@/hooks/use-toast';

const UserDetail: React.FC<any> = ({ user }) => {
  const { documentId }: any = useLocalSearchParams();
  const { user: currentUser } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const toast = useToast();
  const userDocumentIds = currentUser ? [currentUser.documentId, documentId] : [];
  const isMe = documentId === currentUser?.documentId;
  const isFollowing = _.some(currentUser.followings, { documentId });
  const isFriend = _.some(currentUser.friends, { documentId });

  const chatQuery = useFetchChatByUsers({
    enabled: !_.isNil(currentUser),
    userDocumentIds,
  });

  const followMutation = useEditFollow();

  const createFriendRequestMutation = useCreateFriendRequestMutation();

  const cancelFriendMutation = useCancelFriend();

  const createChatMutation = useCreateChat({ userDocumentIds });

  const onShare = () => {};

  const onShowChat = () => {
    if (chatQuery.isSuccess) {
      if (_.isNil(chatQuery.data)) {
        createChatMutation.mutate(undefined, {
          onSuccess: (data: any) => {
            router.push(`/chats/${data.documentId}`);
          },
        });
      } else {
        router.push(`/chats/${chatQuery.data.documentId}`);
      }
    }
  };

  const onModifyFollowing = () => {
    const description = isFollowing
      ? `要取消关注${user.username}吗？`
      : `要关注${user.username}吗？`;

    toast.confirm({
      description,
      onConfirm: async () => {
        followMutation.mutate(
          { documentId },
          {
            onSuccess() {
              toast.success({
                description: isFollowing ? '取消关注成功' : '关注成功',
              });
            },
            onError(error) {
              toast.error(error.message);
            },
          },
        );
      },
    });
  };

  const onModifyFriend = () => {
    const description = isFriend
      ? `要取消和${user.username}的好友关系吗？`
      : `向${user.username}发送添加好友申请吗？`;

    toast.confirm({
      description,
      onConfirm: async () => {
        if (isFriend) {
          cancelFriendMutation.mutate(
            { documentId },
            {
              onSuccess() {
                toast.success({
                  description: '取消好友成功',
                });
              },
              onError(error) {
                toast.error(error.message);
              },
            },
          );
        } else {
          createFriendRequestMutation.mutate(
            { documentId },
            {
              onSuccess() {
                toast.success({
                  description: '已发送好友申请',
                });
              },
              onError(error) {
                toast.error(error.message);
              },
            },
          );
        }
      },
    });
  };

  const onShowFollowings = () => {
    router.push({
      pathname: '/users/following-list',
      params: {
        userDocumentId: user.documentId,
        username: user.username,
      },
    });
  };

  const onShowFollowers = () => {
    router.push({
      pathname: '/users/follower-list',
      params: {
        userDocumentId: user.documentId,
        username: user.username,
      },
    });
  };

  const onShowFriends = () => {
    router.push({
      pathname: '/users/friend-list',
      params: {
        userDocumentId: user.documentId,
        username: user.username,
      },
    });
  };

  return (
    <VStack className="flex-1" space="md">
      <HStack className="items-center justify-between">
        <UserProfileAvatar user={user} />
        <HStack className="items-center" space="md">
          <Button
            size="md"
            action="secondary"
            onPress={() => onShowChat()}
            className="h-8 w-8 rounded-full p-5">
            <ButtonIcon as={MessageCircle} />
          </Button>
          <Button
            action="secondary"
            size="md"
            onPress={() => onShare()}
            className="h-8 w-8 rounded-full p-5">
            <ButtonIcon as={Share2} />
          </Button>
          {!isMe && !isFriend && (
            <Button
              action={isFollowing ? 'primary' : 'secondary'}
              size="md"
              className="h-8 w-8 rounded-full p-5"
              onPress={() => onModifyFollowing()}>
              <ButtonIcon as={isFollowing ? Eye : EyeClosed} />
            </Button>
          )}
          {!isMe && (
            <Button
              action={isFriend ? 'primary' : 'secondary'}
              size="md"
              className="h-8 w-8 rounded-full p-5"
              onPress={() => onModifyFriend()}>
              <ButtonIcon as={isFriend ? UserRoundMinus : UserRoundPlus}></ButtonIcon>
            </Button>
          )}
        </HStack>
      </HStack>
      <HStack space="sm" className="items-center">
        <HStack className="items-center" space="xs">
          <Icon size="xs" as={Calendar} />
          <Text size="xs">{_.isNil(user.birthday) ? '未设置' : user.birthday}</Text>
        </HStack>
        <HStack className="items-center" space="xs">
          <Icon size="xs" as={ScanFace} />
          <Text size="xs">
            {_.isNil(user.gender) ? '未设置' : user.gender === 'male' ? '男' : '女'}
          </Text>
        </HStack>
        <HStack className="items-center" space="xs">
          <Icon size="xs" as={MapPin} />
          <Text size="xs">
            {_.isNil(user.district)
              ? '未设置'
              : `${user.district.provinceName}|${user.district.cityName}|${user.district.districtName}`}
          </Text>
        </HStack>
      </HStack>
      <HStack className="items-center">
        <Text size="sm" numberOfLines={5}>
          {user.bio || '个人签名'}
        </Text>
      </HStack>
      <HStack className="justify-around rounded-lg bg-primary-100 py-3">
        <TouchableOpacity onPress={() => onShowFollowings()}>
          <VStack className="items-center justify-center">
            <Text size="lg" bold={true}>
              {user.followings.length}
            </Text>
            <Text size="sm">关注</Text>
          </VStack>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onShowFollowers()}>
          <VStack className="items-center justify-center">
            <Text size="lg" bold={true}>
              {user.followers.length}
            </Text>
            <Text size="sm">被关注</Text>
          </VStack>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onShowFriends()}>
          <VStack className="items-center justify-center">
            <Text size="lg" bold={true}>
              {user.friends.length}
            </Text>
            <Text size="sm">好友</Text>
          </VStack>
        </TouchableOpacity>
      </HStack>
      <SegmentedControl
        values={['帖子', '照片墙']}
        selectedIndex={selectedIndex}
        onChange={(event) => setSelectedIndex(event.nativeEvent.selectedSegmentIndex)}
      />
      {selectedIndex === 0 ? (
        <PostListView userDocumentId={user.documentId} />
      ) : (
        <PagerViewProvider>
          <PhotoListView userDocumentId={user.documentId} />
        </PagerViewProvider>
      )}
    </VStack>
  );
};

const UserDetailPage: React.FC = () => {
  const { documentId }: any = useLocalSearchParams();

  const userQuery = useFetchUser({ documentId });

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

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <VStack className="flex-1 p-4">
        {userQuery.isLoading && <UserDetailSkeleton />}
        {userQuery.isSuccess && <UserDetail user={userQuery.data} />}
      </VStack>
    </SafeAreaView>
  );
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default UserDetailPage;
