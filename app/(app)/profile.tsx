import React, { useState } from 'react';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { router, Stack } from 'expo-router';
import { Calendar, EditIcon, MapPin, ScanFace, Settings, Settings2 } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import AlbumListView from '@/components/album-list-view';
import { useAuth } from '@/components/auth-provider';
import PostListView from '@/components/post-list-view';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { thumbnailSize } from '@/utils/file';
import { UserLargeAvatar } from '@/components/user';

const Profil: React.FC = () => {
  const { user } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const onFollowingsBtnPress = () => {
    router.push({
      pathname: '/following-list',
      params: {
        documentId: user.documentId,
      },
    });
  };

  const onFollowersBtnPress = () => {
    router.push({
      pathname: '/follower-list',
      params: {
        documentId: user.documentId,
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
          <UserLargeAvatar user={user} />
          <HStack className="items-center" space="md">
            <Button
              size="md"
              className="h-8 w-8 rounded-full p-5"
              action="secondary"
              onPress={() => {
                router.push('/user-edit');
              }}>
              <ButtonIcon as={EditIcon} />
            </Button>
            <Button
              size="md"
              className="h-8 w-8 rounded-full p-5"
              action="secondary"
              onPress={() => {
                router.push('/setting');
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
          values={['我的帖子', '照片墙']}
          selectedIndex={selectedIndex}
          onChange={(event) => setSelectedIndex(event.nativeEvent.selectedSegmentIndex)}
        />
        {selectedIndex === 0 ? (
          <PostListView userDocumentId={user.documentId} />
        ) : (
          <AlbumListView userDocumentId={user.documentId} />
        )}
      </VStack>
    </SafeAreaView>
  );
};

export default Profil;
