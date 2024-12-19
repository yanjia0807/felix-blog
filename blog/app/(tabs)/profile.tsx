import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useQuery } from '@tanstack/react-query';
import { Redirect, router, Stack } from 'expo-router';
import _ from 'lodash';
import { Calendar, EditIcon, MapPin, ScanFace, Settings2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { apiServerURL, fetchMyPostCount } from '@/api';
import { useAuth } from '@/components/auth-context';
import PhotoListView from '@/components/photo-list-view';
import PostListView from '@/components/post-list-view';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const ProfileScreen = () => {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/anonymous" />;
  }

  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: total } = useQuery<any>({
    queryKey: ['posts', user?.documentId, 'total'],
    queryFn: () => fetchMyPostCount(),
    enabled: !!user,
  });

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '我的',
        }}
      />
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <VStack className="flex-1" space="xl">
          <HStack className="items-center justify-between">
            <Avatar size="lg" className="shadow">
              <AvatarImage
                source={{
                  uri: `${apiServerURL}/${user.profile?.avatar?.formats.thumbnail.url}`,
                }}
              />
            </Avatar>
            <HStack className="items-center" space="sm">
              <Button
                size="sm"
                className="rounded-3xl px-6"
                onPress={() => {
                  router.push('/profile-edit');
                }}>
                <ButtonText>编辑</ButtonText>
                <ButtonIcon as={EditIcon} />
              </Button>
              <Button
                size="sm"
                className="rounded-3xl px-6"
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
                <Text size="xs">{user.profile.birthday}</Text>
              </HStack>
              <HStack className="items-center" space="xs">
                <Icon size="xs" as={ScanFace} />
                <Text size="xs">{user.profile.gender === 'male' ? '男' : '女'}</Text>
              </HStack>
              <HStack className="items-center" space="xs">
                <Icon size="xs" as={MapPin} />
                <Text size="xs">重庆｜南岸区</Text>
              </HStack>
            </HStack>
            <Text size="sm">{user.profile?.bio || '个人签名'}</Text>
          </VStack>
          <HStack
            space="md"
            className="justify-around rounded-lg border-y border-primary-100 bg-primary-200 py-3">
            <VStack className="items-center justify-center">
              <Text size="xl" bold={true}>
                {total?.data || 0}
              </Text>
              <Text size="sm">帖子</Text>
            </VStack>
            <VStack className="items-center justify-center">
              <Text size="xl" bold={true}>
                21
              </Text>
              <Text size="sm">关注</Text>
            </VStack>
            <VStack className="items-center justify-center">
              <Text size="xl" bold={true}>
                3
              </Text>
              <Text size="sm">被关注</Text>
            </VStack>
          </HStack>
          <SegmentedControl
            values={['我的帖子', '照片墙']}
            selectedIndex={selectedIndex}
            onChange={(event) => setSelectedIndex(event.nativeEvent.selectedSegmentIndex)}
          />
          {selectedIndex === 0 ? <PostListView user={user} /> : <PhotoListView user={user} />}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
