import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import {
  Calendar,
  ChevronLeft,
  MapPin,
  MessageCircle,
  ScanFace,
  Share2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList } from 'react-native';
import {
  apiServerURL,
  createChat,
  fetchChatByUsers,
  fetchUser,
  isFollowingUser,
  updateFollowings,
} from '@/api';
import { useAuth } from '@/components/auth-context';
import PageSpinner from '@/components/page-spinner';
import PhotoListView from '@/components/photo-list-view';
import PostListView from '@/components/post-list-view';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';

const UserDetailSkeleton = () => (
  <VStack space="xl">
    <HStack className="items-center" space="lg">
      <Skeleton variant="circular" className="h-24 w-24" />
      <VStack space="sm" className="flex-1">
        <SkeletonText _lines={2} className="h-2 w-1/2" />
      </VStack>
    </HStack>
    <SkeletonText _lines={4} className="h-2" />
    <Skeleton variant="rounded" className="my-2 h-20 w-full" />
    <HStack space="sm">
      <Skeleton variant="rounded" className="h-12 flex-1" />
      <Skeleton variant="rounded" className="h-12 flex-1" />
    </HStack>
    <Skeleton variant="rounded" className="mb-2 h-36 flex-1" />
    <Skeleton variant="rounded" className="h-36 flex-1" />
  </VStack>
);

const UserDetailHeader: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { documentId }: any = useLocalSearchParams();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const queryClient = useQueryClient();
  const toast = useCustomToast();
  const userDocumentIds = currentUser ? [currentUser.documentId, documentId] : [];

  const {
    isLoading: isLoadingUser,
    isSuccess: isLoadUserSuccess,
    data: user,
  } = useQuery({
    queryKey: ['users', documentId],
    queryFn: () => fetchUser(documentId),
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

  const { data: chatData, isSuccess: isQueryChatSuccess } = useQuery({
    queryKey: ['chats', 'list', { userDocumentIds }],
    enabled: !!currentUser,
    queryFn: () => fetchChatByUsers({ userDocumentIds }),
  });

  const { data: isFollowing } = useQuery({
    queryKey: ['users', 'me', 'followings', documentId],
    enabled: !!currentUser,
    queryFn: () => isFollowingUser({ following: documentId }),
  });

  const { isPending: isFollowPending, mutate: followMutate } = useMutation({
    mutationFn: () => {
      const params = { following: user.documentId };
      return updateFollowings(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'me'],
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

  const renderUser = () => (
    <>
      <VStack space="xl">
        <HStack className="items-center" space="lg">
          <Avatar size="xl" className="shadow">
            <AvatarFallbackText>{user.username}</AvatarFallbackText>
            <AvatarImage
              source={{
                uri: `${apiServerURL}${user.avatar?.formats.thumbnail.url}`,
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
          <Text size="sm">{user.bio || '个人签名'}</Text>
        </HStack>
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
            action={isFollowing ? 'negative' : 'positive'}
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
        <HStack
          space="md"
          className="justify-around rounded-lg border-y border-primary-100 bg-primary-200 py-3">
          <VStack className="items-center justify-center">
            <Text size="xl" bold={true}>
              {user.posts?.count}
            </Text>
            <Text size="sm">帖子</Text>
          </VStack>
          <Pressable onPress={() => onFollowingsBtnPress()}>
            <VStack className="items-center justify-center">
              <Text size="xl" bold={true}>
                {user.followings.count}
              </Text>
              <Text size="sm">关注</Text>
            </VStack>
          </Pressable>
          <Pressable onPress={() => onFollowersBtnPress()}>
            <VStack className="items-center justify-center">
              <Text size="xl" bold={true}>
                {user.followers.count}
              </Text>
              <Text size="sm">被关注</Text>
            </VStack>
          </Pressable>
        </HStack>
        <SegmentedControl
          values={['帖子', '照片墙']}
          selectedIndex={selectedIndex}
          onChange={(event) => setSelectedIndex(event.nativeEvent.selectedSegmentIndex)}
        />
        {selectedIndex === 0 ? (
          <PostListView userDocumentId={user.documentId} />
        ) : (
          <PhotoListView userDocumentId={user.documentId} />
        )}
      </VStack>
    </>
  );

  return (
    <VStack className="flex-1 p-4">
      <PageSpinner isVisiable={isLoadingUser} />
      {isLoadingUser && <UserDetailSkeleton />}
      {isLoadUserSuccess && renderUser()}
    </VStack>
  );
};

const UserDetail: React.FC = () => {
  const renderListHeader = (props: any) => <UserDetailHeader {...props} />;

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

  const renderItem = () => <></>;

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <VStack className="flex-1 px-4">
        <FlatList
          data={[]}
          ListHeaderComponent={renderListHeader}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </VStack>
    </SafeAreaView>
  );
};

export default UserDetail;
