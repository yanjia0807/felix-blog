import React, { useState } from 'react';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import {
  createChat,
  fetchChatByUsers,
  fetchUser,
  updateFollowings,
  createFriendRequest,
  cancelFriend,
} from '@/api';
import AlbumListView from '@/components/album-list-view';
import { useAuth } from '@/components/auth-provider';
import PageSpinner from '@/components/page-spinner';
import PostListView from '@/components/post-list-view';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { UserLargeAvatar } from '@/components/user';
import useCustomToast from '@/hooks/use-custom-toast';

interface UserDetailProps {
  user: any;
}

const UserDetailSkeleton = () => (
  <VStack space="xl">
    <HStack className="items-center" space="lg">
      <Skeleton variant="circular" className="h-24 w-24" />
      <VStack space="sm" className="flex-1">
        <SkeletonText _lines={2} className="h-2 w-1/2" />
      </VStack>
    </HStack>
    <SkeletonText _lines={3} className="h-2" />
    <Skeleton variant="rounded" className="my-2 h-20 w-full" />
    <HStack space="sm">
      <Skeleton variant="rounded" className="h-12 flex-1" />
      <Skeleton variant="rounded" className="h-12 flex-1" />
    </HStack>
    <Skeleton variant="rounded" className="mb-2 h-36 flex-1" />
    <Skeleton variant="rounded" className="h-36 flex-1" />
  </VStack>
);

const UserDetail: React.FC<UserDetailProps> = ({ user }) => {
  const { documentId }: any = useLocalSearchParams();
  const { user: currentUser } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const queryClient = useQueryClient();
  const toast = useCustomToast();
  const userDocumentIds = currentUser ? [currentUser.documentId, documentId] : [];
  const isMe = documentId === currentUser?.documentId;
  const isFollowing = _.some(currentUser.followings, { documentId });
  const isFriend = _.some(currentUser.friends, { documentId });

  const { data: chatData, isSuccess: isQueryChatSuccess } = useQuery({
    queryKey: ['chats', 'list', { userDocumentIds }],
    enabled: !!currentUser,
    queryFn: () => fetchChatByUsers({ userDocumentIds }),
  });

  const followMutation = useMutation({
    mutationFn: () => {
      const params = { following: documentId };
      return updateFollowings(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', 'me'],
      });
      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', { documentId }],
      });
      queryClient.invalidateQueries({
        queryKey: ['followings', 'list'],
      });
      queryClient.invalidateQueries({
        queryKey: ['followers', 'list'],
      });

      toast.success({
        description: isFollowing ? '取消关注成功' : '关注成功',
      });
    },
    onError(error, variables, context) {
      toast.error(error.message);
      console.error(error);
    },
  });

  const createFriendRequestMutation = useMutation({
    mutationFn: () => {
      const params = { receiver: documentId };
      return createFriendRequest(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['friendRequest', 'list', { receiver: documentId }],
      });
      toast.success({
        description: '已发送好友申请',
      });
    },
    onError(error, variables, context) {
      toast.error(error.message);
      console.error(error);
    },
  });

  const cancelFriendMutation = useMutation({
    mutationFn: () => {
      const params = { friend: documentId };
      return cancelFriend(params);
    },
    onSuccess: async (data, variables) => {
      toast.success({
        description: '取消好友成功',
      });

      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', 'me'],
      });

      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', { documentId }],
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
    },
    onError(error) {
      toast.error(error.message);
      console.error(error);
    },
  });

  const createChatMutation = useMutation({
    mutationFn: () =>
      createChat({
        userDocumentIds,
      }),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['chats', 'list'],
      });
    },
  });

  const onShare = () => {};

  const onShowChat = () => {
    if (isQueryChatSuccess) {
      if (chatData) {
        router.push(`/chat/${chatData.documentId}`);
      } else {
        createChatMutation.mutate(undefined, {
          onSuccess: (data: any) => {
            router.push(`/chat/${data.documentId}`);
          },
        });
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
        toast.close();
        followMutation.mutate();
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
        toast.close();
        if (isFriend) {
          cancelFriendMutation.mutate();
        } else {
          createFriendRequestMutation.mutate();
        }
      },
    });
  };

  const onShowFollowings = () => {
    router.push({
      pathname: '/following-list',
      params: {
        userDocumentId: user.documentId,
        username: user.username,
      },
    });
  };

  const onShowFollowers = () => {
    router.push({
      pathname: '/follower-list',
      params: {
        userDocumentId: user.documentId,
        username: user.username,
      },
    });
  };

  const onShowFriends = () => {
    router.push({
      pathname: '/friend-list',
      params: {
        userDocumentId: user.documentId,
        username: user.username,
      },
    });
  };

  return (
    <VStack className="flex-1" space="md">
      <HStack className="items-center justify-between">
        <UserLargeAvatar user={user} />
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
        <AlbumListView userDocumentId={user.documentId} />
      )}
    </VStack>
  );
};

const UserDetailPage: React.FC = () => {
  const { documentId }: any = useLocalSearchParams();

  const {
    isLoading,
    isSuccess,
    data: user,
  } = useQuery({
    queryKey: ['users', 'detail', { documentId }],
    queryFn: () => fetchUser(documentId),
  });

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
        <PageSpinner isVisiable={isLoading} />
        {isLoading ? <UserDetailSkeleton /> : isSuccess ? <UserDetail user={user} /> : <></>}
      </VStack>
    </SafeAreaView>
  );
};

export default UserDetailPage;
