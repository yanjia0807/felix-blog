import React, { useState } from 'react';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { router, Stack } from 'expo-router';
import { Calendar, EditIcon, MapPin, ScanFace, Settings } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { PageFallbackUI } from '@/components/fallback';
import { PagerViewProvider } from '@/components/pager-view';
import PhotoListView from '@/components/photo-list-view';
import PostListView from '@/components/post-list-view';
import { Button, ButtonIcon } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import { UserProfileAvatar } from '@/features/user/components/user-profile-avater';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '我的',
        }}
      />
      <VStack className="flex-1 p-4" space="md">
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
            {user.district && (
              <HStack className="items-center" space="xs">
                <Icon size="xs" as={MapPin} />
                <Text size="xs">{`${user.district?.provinceName}|${user.district?.cityName}|${user.district?.districtName}`}</Text>
              </HStack>
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
    </SafeAreaView>
  );
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default Profile;
