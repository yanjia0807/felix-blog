import React, { useState } from 'react';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Redirect, router, Stack } from 'expo-router';
import { Calendar, EditIcon, MapPin, ScanFace, Settings2 } from 'lucide-react-native';
import { FlatList, Pressable } from 'react-native';
import { apiServerURL } from '@/api';
import AlbumListView from '@/components/album-list-view';
import { useAuth } from '@/components/auth-context';
import PostListView from '@/components/post-list-view';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const ProfileHeader: React.FC = () => {
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
    <VStack className="flex-1" space="xl">
      <HStack className="items-center justify-between">
        <Avatar size="lg">
          <AvatarFallbackText>{user.username}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: `${apiServerURL}${user.avatar?.formats.thumbnail.url}`,
            }}
          />
        </Avatar>
        <HStack className="items-center" space="sm">
          <Button
            size="sm"
            className="rounded-3xl px-6"
            action="primary"
            onPress={() => {
              router.push('/user-edit');
            }}>
            <ButtonText>编辑</ButtonText>
            <ButtonIcon as={EditIcon} />
          </Button>
          <Button
            size="sm"
            className="rounded-3xl px-6"
            action="secondary"
            onPress={() => {
              router.push('/setting');
            }}>
            <ButtonText>设置</ButtonText>
            <ButtonIcon as={Settings2} />
          </Button>
        </HStack>
      </HStack>
      <VStack space="md">
        <Text size="3xl" bold={true}>
          {user.username}
        </Text>
        <HStack space="md" className="items-center">
          <HStack className="items-center" space="xs">
            <Icon size="xs" as={Calendar} />
            <Text size="xs">{user.birthday || '未设置'}</Text>
          </HStack>
          <HStack className="items-center" space="xs">
            <Icon size="xs" as={ScanFace} />
            <Text size="xs">{user.gender ? (user.gender === 'male' ? '男' : '女') : '未设置'}</Text>
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
      <HStack
        space="md"
        className="justify-around rounded-lg border-y border-primary-50 bg-primary-100 py-3">
        <VStack className="items-center justify-center">
          <Text size="xl" bold={true}>
            {user.posts.count}
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
  );
};

const Profile: React.FC = () => {
  const renderItem = () => <></>;
  const renderListHeader = (props: any) => <ProfileHeader {...props} />;

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '我的',
        }}
      />
      <VStack className="flex-1 p-4">
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

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  return user ? <Profile /> : <Redirect href="/anonymous" />;
};

export default ProfilePage;
