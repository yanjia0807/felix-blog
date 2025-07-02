import { CarouselProvider } from '@/components/carousel-provider';
import CarouselViewer from '@/components/carousel-viewer';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useFetchPosts } from '@/features/post/api/use-fetch-posts';
import { useFetchUserPhotos } from '@/features/post/api/use-fetch-user-photos';
import PhotoListView from '@/features/post/components/photo-list-view';
import PostListView from '@/features/post/components/post-list-view';
import { ProfileSkeleton } from '@/features/user/components/profile-skeleton';
import { UserProfileAvatar } from '@/features/user/components/user-profile-avater';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { router } from 'expo-router';
import _ from 'lodash';
import { Calendar, EditIcon, MapPin, ScanFace, Settings } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const HEADER_HEIGHT = 280;

const ProfileHeader: React.FC<any> = ({
  selectedIndex,
  setSelectedIndex,
  publishStatus,
  setPublishStatus,
  scrollOffset,
}) => {
  const { user } = useAuth();

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

  const onShowFollowings = () => {
    router.push({
      pathname: '/users/following-list',
      params: {
        userDocumentId: user.documentId,
      },
    });
  };

  const onShowFollowers = () => {
    router.push({
      pathname: '/users/follower-list',
      params: {
        userDocumentId: user.documentId,
      },
    });
  };

  const onShowFriends = () => {
    router.push({
      pathname: '/users/friend-list',
      params: {
        userDocumentId: user.documentId,
      },
    });
  };

  const onSegmentChange = (event) => {
    const index = event.nativeEvent.selectedSegmentIndex;
    setTimeout(() => (scrollOffset.value = 0), 0);
    setSelectedIndex(index);
  };

  const onPublishStatusChange = (publishStatus) => setPublishStatus(publishStatus);

  return (
    <Animated.View style={[styles, { height: HEADER_HEIGHT, zIndex: 10 }]}>
      <VStack space="md">
        <HStack className="items-center justify-between">
          <UserProfileAvatar user={user} />
          <HStack className="items-center" space="md">
            <Button
              size="md"
              className="h-8 w-8 rounded-full p-5"
              action="secondary"
              onPress={() => {
                router.push(`/users/edit?timestamp=${Date.now()}`);
              }}>
              <ButtonIcon as={EditIcon} />
            </Button>
            <Button
              size="md"
              className="h-8 w-8 rounded-full p-5"
              action="secondary"
              onPress={() => {
                router.push('/users/setting');
              }}>
              <ButtonIcon as={Settings} />
            </Button>
          </HStack>
        </HStack>
        <VStack space="md">
          <HStack space="sm" className="items-center">
            <HStack className="items-center" space="xs">
              <Icon size="xs" as={Calendar} />
              <Text size="xs">{user.birthday || '未设置'}</Text>
            </HStack>
            <HStack className="items-center" space="xs">
              <Icon size="xs" as={ScanFace} />
              <Text size="xs">
                {user.gender ? (user.gender === 'male' ? '男' : '女') : '未设置'}
              </Text>
            </HStack>
            {user.district ? (
              <HStack className="items-center" space="xs">
                <Icon size="xs" as={MapPin} />
                <Text size="xs">
                  {_.concat(
                    !!user.district?.provinceName ? user.district?.provinceName : '',
                    !!user.district?.cityName ? ' ' + user.district?.cityName : '',
                    !!user.district?.districtName ? ' ' + user.district?.districtName : '',
                  )}
                </Text>
              </HStack>
            ) : (
              '未设置'
            )}
          </HStack>
          <Text size="sm">{user?.bio || '个人签名'}</Text>
        </VStack>
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
          values={['我的帖子', '照片墙']}
          selectedIndex={selectedIndex}
          onChange={onSegmentChange}
        />
        {selectedIndex === 0 ? (
          <HStack className="items-center justify-end" space="sm">
            <Button
              size="sm"
              action="secondary"
              variant="link"
              onPress={() => onPublishStatusChange('published')}>
              <ButtonText className={publishStatus === 'published' ? 'underline' : undefined}>
                已发布
              </ButtonText>
            </Button>
            <Divider orientation="vertical" className="h-4" />
            <Button
              size="sm"
              action="secondary"
              variant="link"
              onPress={() => onPublishStatusChange('draft')}>
              <ButtonText className={publishStatus === 'draft' ? 'underline' : undefined}>
                未发布
              </ButtonText>
            </Button>
          </HStack>
        ) : (
          <HStack className="h-4" />
        )}
      </VStack>
    </Animated.View>
  );
};

const Profile: React.FC<any> = () => {
  const { user } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [publishStatus, setPublishStatus] = useState('published');
  const userDocumentId = user.documentId;
  const isPublished = publishStatus === 'published';

  const userPostsQuery = useFetchPosts({
    author: userDocumentId,
    isPublished,
  });

  const userPhotosQuery = useFetchUserPhotos({ userDocumentId });

  const scrollOffset = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollOffset.value = event.contentOffset.y;
  });

  if (userPostsQuery.data) {
    return (
      <SafeAreaView className="flex-1">
        <VStack className="flex-1 overflow-hidden p-4" space="md">
          <ProfileHeader
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            setPublishStatus={setPublishStatus}
            scrollOffset={scrollOffset}
          />
          <View
            className={`absolute bottom-0 left-0 right-0 top-0 flex-1 px-4 ${selectedIndex === 0 ? 'block' : 'hidden'}`}>
            <PostListView
              query={userPostsQuery}
              publishStatus={publishStatus}
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
    );
  }

  return <ProfileSkeleton />;
};

const ProfileLayout: React.FC<any> = () => {
  return (
    <CarouselProvider>
      <Profile />
      <CarouselViewer />
    </CarouselProvider>
  );
};

export default ProfileLayout;
