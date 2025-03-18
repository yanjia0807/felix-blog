import React, { useState } from 'react';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
  Calendar,
  ChevronLeft,
  MapPin,
  MessageCircle,
  ScanFace,
  Share2,
} from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { createChat, fetchChatByUsers, fetchUser, isFollowingUser, updateFollowings } from '@/api';
import AlbumListView from '@/components/album-list-view';
import { useAuth } from '@/components/auth-context';
import PageSpinner from '@/components/page-spinner';
import PostListView from '@/components/post-list-view';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';
import { thumbnailSize } from '@/utils/file';

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

  const { data: chatData, isSuccess: isQueryChatSuccess } = useQuery({
    queryKey: ['chats', 'list', { userDocumentIds }],
    enabled: !!currentUser,
    queryFn: () => fetchChatByUsers({ userDocumentIds }),
  });

  const { data: isFollowing } = useQuery({
    queryKey: ['users', 'detail', 'me', 'followings', documentId],
    enabled: !!currentUser,
    queryFn: () => isFollowingUser({ following: documentId }),
  });

  const { mutate: createChatMutate } = useMutation({
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

  const { isPending: isFollowPending, mutate: followMutate } = useMutation({
    mutationFn: () => {
      const params = { following: user.documentId };
      return updateFollowings(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', 'me'],
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

  const onShareButtonPressed = () => {};

  const onChatButtonPressed = () => {
    if (isQueryChatSuccess) {
      if (chatData) {
        router.push(`/chat/${chatData.documentId}`);
      } else {
        createChatMutate(undefined, {
          onSuccess: (data: any) => {
            router.push(`/chat/${data.documentId}`);
          },
        });
      }
    }
  };

  const onFollowBtnPressed = () => followMutate();

  const onFollowingsBtnPress = () => {
    router.push({
      pathname: '/following-list',
      params: {
        documentId: user.documentId,
        username: user.username,
      },
    });
  };

  const onFollowersBtnPress = () => {
    router.push({
      pathname: '/follower-list',
      params: {
        documentId: user.documentId,
        username: user.username,
      },
    });
  };

  return (
    <VStack className="flex-1" space="md">
      <HStack className="items-center" space="md">
        <Avatar size="xl">
          <AvatarFallbackText>{user.username}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: thumbnailSize(user.avatar),
            }}
          />
        </Avatar>
        <VStack space="sm">
          <Text size="2xl" bold={true}>
            {user.username}
          </Text>
          <HStack space="sm">
            <HStack className="items-center" space="xs">
              <Icon size="xs" as={Calendar} />
              <Text size="xs">{user.birthday}</Text>
            </HStack>
            <HStack className="items-center" space="xs">
              <Icon size="xs" as={ScanFace} />
              <Text size="xs">{user.gender === 'male' ? '男' : '女'}</Text>
            </HStack>
            {user.district && (
              <HStack className="items-center" space="xs">
                <Icon size="xs" as={MapPin} />
                <Text size="xs">{`${user.district.provinceName}|${user.district.cityName}|${user.district.districtName}`}</Text>
              </HStack>
            )}
          </HStack>
        </VStack>
      </HStack>
      <HStack className="items-center justify-center">
        <Text size="sm" numberOfLines={5}>
          {user.bio || '个人签名'}
        </Text>
      </HStack>
      {!isMe && (
        <HStack className="items-center justify-center" space="2xl">
          <Button
            size="md"
            action="secondary"
            onPress={() => onChatButtonPressed()}
            className="items-center justify-center rounded-3xl p-2.5">
            <ButtonIcon as={MessageCircle} />
          </Button>
          <Button
            disabled={!currentUser}
            action={isFollowing ? 'secondary' : 'primary'}
            className="rounded-3xl px-16"
            onPress={() => onFollowBtnPressed()}>
            <ButtonText>{isFollowing ? '取消关注' : '关注'}</ButtonText>
            {isFollowPending && <ButtonSpinner />}
          </Button>
          <Button
            action="secondary"
            size="md"
            onPress={() => onShareButtonPressed()}
            className="items-center justify-center rounded-3xl p-2.5">
            <ButtonIcon as={Share2} />
          </Button>
        </HStack>
      )}
      <HStack className="justify-around rounded-lg border-y border-primary-50 bg-primary-100 py-3">
        <VStack className="items-center justify-center">
          <Text size="lg" bold={true}>
            {user.posts.count}
          </Text>
          <Text size="sm">帖子</Text>
        </VStack>
        <TouchableOpacity onPress={() => onFollowingsBtnPress()}>
          <VStack className="items-center justify-center">
            <Text size="lg" bold={true}>
              {user.followings.count}
            </Text>
            <Text size="sm">关注</Text>
          </VStack>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onFollowersBtnPress()}>
          <VStack className="items-center justify-center">
            <Text size="lg" bold={true}>
              {user.followers.count}
            </Text>
            <Text size="sm">被关注</Text>
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
    queryKey: ['users', 'detail', documentId],
    queryFn: () => fetchUser(documentId),
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
