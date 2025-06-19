import { CarouselProvider } from '@/components/carousel-provider';
import CarouselViewer from '@/components/carousel-viewer';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useCreateChat } from '@/features/chat/api/use-create-chat';
import { useFetchChatByUsers } from '@/features/chat/api/use-fetch-chat-by-users';
import { useFetchPosts } from '@/features/post/api/use-fetch-posts';
import { useFetchUserPhotos } from '@/features/post/api/use-fetch-user-photos';
import PhotoListView from '@/features/post/components/photo-list-view';
import PostListView from '@/features/post/components/post-list-view';
import { useCancelFriend } from '@/features/user/api/use-cancel-friend';
import { useCreateFriendRequestMutation } from '@/features/user/api/use-create-friend-request';
import { useEditFollow } from '@/features/user/api/use-edit-follow';
import { useFetchUser } from '@/features/user/api/use-fetch-user';
import { UserContextMenu } from '@/features/user/components/user-context-menu';
import { UserDetailSkeleton } from '@/features/user/components/user-detail-skeleton';
import { UserProfileAvatar } from '@/features/user/components/user-profile-avater';
import useToast from '@/hooks/use-toast';
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
  UserRoundMinus,
  UserRoundPlus,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const HEADER_HEIGHT = 290;

const UserDetailHeader: React.FC<any> = ({
  user,
  scrollOffset,
  selectedIndex,
  setSelectedIndex,
}) => {
  const { user: currentUser } = useAuth();
  const { documentId }: any = useLocalSearchParams();
  const toast = useToast();
  const userDocumentIds = currentUser ? [currentUser.documentId, documentId] : [];
  const isMe = documentId === currentUser?.documentId;
  const isFollowing = _.some(currentUser?.followings, { documentId });
  const isFriend = _.some(currentUser?.friends, { documentId });

  const styles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(scrollOffset.value, [0, HEADER_HEIGHT], [0, -HEADER_HEIGHT], {
            extrapolateLeft: Extrapolation.CLAMP,
          }),
        },
      ],
    };
  });

  const chatQuery = useFetchChatByUsers({
    enabled: !!currentUser,
    userDocumentIds,
  });

  const followMutation = useEditFollow();

  const createFriendRequestMutation = useCreateFriendRequestMutation();

  const cancelFriendMutation = useCancelFriend();

  const createChatMutation = useCreateChat({ userDocumentIds });

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

  const onSegmentChange = (event) => {
    const index = event.nativeEvent.selectedSegmentIndex;
    setTimeout(() => (scrollOffset.value = 0), 0);
    setSelectedIndex(index);
  };

  return (
    <Animated.View style={[styles, { height: HEADER_HEIGHT, zIndex: 10 }]}>
      <VStack className="flex-1" space="md">
        {!!currentUser && (
          <HStack className="items-center justify-end" space="md">
            {!isMe && (
              <Button size="sm" action="secondary" variant="link" onPress={() => onShowChat()}>
                <ButtonIcon as={MessageCircle} />
                <ButtonText>发消息</ButtonText>
              </Button>
            )}
            {!isMe && !isFriend && (
              <Button
                action={isFollowing ? 'primary' : 'secondary'}
                variant="link"
                size="sm"
                onPress={() => onModifyFollowing()}>
                <ButtonIcon as={isFollowing ? Eye : EyeClosed} />
                <ButtonText>{isFollowing ? '已关注' : '关注'}</ButtonText>
              </Button>
            )}
            {!isMe && (
              <Button
                action={isFriend ? 'primary' : 'secondary'}
                variant="link"
                size="sm"
                onPress={() => onModifyFriend()}>
                <ButtonIcon as={isFriend ? UserRoundMinus : UserRoundPlus} />
                <ButtonText>{isFriend ? '删好友' : '加好友'}</ButtonText>
              </Button>
            )}
          </HStack>
        )}
        <HStack className="items-center justify-between">
          <UserProfileAvatar user={user} />
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
          onChange={onSegmentChange}
        />
      </VStack>
    </Animated.View>
  );
};

const UserDetail: React.FC<any> = () => {
  const { user: currentUser } = useAuth();
  const { documentId }: any = useLocalSearchParams();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const userQuery = useFetchUser({ documentId });
  const user = userQuery?.data;
  const userDocumentId = user?.documentId;

  const userPostsQuery = useFetchPosts({
    authorDocumentId: userDocumentId,
    isPublished: true,
  });

  const userPhotosQuery = useFetchUserPhotos({ userDocumentId });

  const scrollOffset = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollOffset.value = event.contentOffset.y;
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

  const renderHeaderRight = () => {
    if (!currentUser) return null;
    return <UserContextMenu documentId={documentId} />;
  };

  if (user) {
    return (
      <>
        <Stack.Screen
          options={{
            title: '',
            headerShown: true,
            headerLeft: renderHeaderLeft,
            headerRight: renderHeaderRight,
          }}
        />
        <SafeAreaView className="flex-1">
          <VStack className="flex-1 overflow-hidden p-4" space="md">
            <UserDetailHeader
              user={user}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              scrollOffset={scrollOffset}
            />
            <View
              className={`absolute bottom-0 left-0 right-0 top-0 flex-1 px-4 ${selectedIndex === 0 ? 'block' : 'hidden'}`}>
              <PostListView
                query={userPostsQuery}
                userDocumentId={user.documentId}
                scrollHandler={scrollHandler}
                headerHeight={HEADER_HEIGHT}
              />
            </View>
            <View
              className={`absolute bottom-0 left-0 right-0 top-0 flex-1 px-4 ${selectedIndex === 1 ? 'block' : 'hidden'}`}>
              <PhotoListView
                query={userPhotosQuery}
                userDocumentId={user.documentId}
                scrollOffset={scrollOffset}
                scrollHandler={scrollHandler}
                headerHeight={HEADER_HEIGHT}
              />
            </View>
          </VStack>
        </SafeAreaView>
      </>
    );
  }

  return <UserDetailSkeleton />;
};

const UserDetailLayout: React.FC = () => {
  return (
    <CarouselProvider>
      <UserDetail />
      <CarouselViewer />
    </CarouselProvider>
  );
};

export default UserDetailLayout;
