import React from 'react';
import { Stack } from 'expo-router';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/components/auth-context';
import { ProfileAvatar } from '@/components/profile-avatar';
import useAlertToast from '@/components/use-alert-toast';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { ImageBackground, SafeAreaView, useWindowDimensions } from 'react-native';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { ArrowRightIcon, SearchIcon } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import { Box } from '@/components/ui/box';
import { Link, LinkText } from '@/components/ui/link';
import { Icon } from '@/components/ui/icon';

const tags = [
  { id: 1, name: '生活' },
  { id: 2, name: '旅行' },
  { id: 3, name: '美食' },
  { id: 4, name: '科技' },
  { id: 5, name: '健康' },
  { id: 6, name: '运动' },
  { id: 7, name: '摄影' },
  { id: 8, name: '阅读' },
  { id: 9, name: '学习' },
  { id: 10, name: '创业' },
  { id: 11, name: '情感' },
  { id: 12, name: '艺术' },
  { id: 13, name: '音乐' },
  { id: 14, name: '电影' },
  { id: 15, name: '自我成长' },
];

const posts = [
  {
    id: 101,
    title: '探索重庆的美食之旅',
    content:
      '重庆，这座火辣的城市不仅有美丽的风景，还有丰富的美食文化。今天我们深入探访了当地的火锅美食基地，尝试了各种口味的火锅底料，让人回味无穷。',
    cover: 'https://unsplash.it/640/425',
    author: {
      id: 1,
      name: '李小明',
      avatar: 'https://example.com/avatars/liming.jpg',
    },
    publishedAt: '2024-11-01T10:00:00Z',
    likes: 120,
    unlikes: 5,
    comments: 2,
  },
  {
    id: 102,
    title: '科技改变生活',
    content:
      '现代科技发展迅速，从智能家居到AI助手，每个细节都让我们的生活变得更加便利与智能化。未来的生活将会有更多的惊喜等待我们去探索。',
    cover: 'https://unsplash.it/640/425',
    author: {
      id: 2,
      name: '王科技',
      avatar: 'https://example.com/avatars/wangkeji.jpg',
    },
    publishedAt: '2024-11-05T14:30:00Z',
    likes: 250,
    unlikes: 10,
    comments: 2,
  },
  {
    id: 103,
    title: '健康生活的小秘诀',
    content:
      '健康生活不仅仅是饮食和锻炼，它还包括保持良好的心态。每天早上一个简单的冥想，晚上一个放松的热水澡，都能带来健康的身心状态。',
    cover: 'https://unsplash.it/640/425',
    author: {
      id: 3,
      name: '健康达人',
      avatar: 'https://example.com/avatars/jiankangdaren.jpg',
    },
    publishedAt: '2024-11-10T08:45:00Z',
    likes: 300,
    unlikes: 3,
    comments: 2,
  },
];

const Home = () => {
  const { user, logout } = useAuth();
  const toast = useAlertToast();
  const dimension = useWindowDimensions();

  const renderTagItem = ({ item }: any) => {
    return (
      <Box className="m-2 rounded-lg bg-secondary-200 p-1 px-3">
        <Text>{item.name}</Text>
      </Box>
    );
  };

  const renderPostItem = ({ item }: any) => {
    return (
      <ImageBackground
        source={{
          uri: item.cover,
        }}
        imageStyle={{
          borderRadius: 16,
        }}
        className="m-4 h-52 w-80">
        <HStack className="absolute bottom-0 w-full rounded-bl-[16] rounded-br-[16] bg-white p-4">
          <Text className="mb-2 text-sm font-normal text-typography-700">May 15, 2023</Text>
          <Heading size="md" className="mb-4"></Heading>
          <Link href="https://gluestack.io/" isExternal>
            <HStack className="items-center">
              <LinkText size="sm" className="font-semibold text-info-600 no-underline">
                Read Blog
              </LinkText>
              <Icon as={ArrowRightIcon} size="sm" className="ml-0.5 mt-0.5 text-info-600" />
            </HStack>
          </Link>
        </HStack>
      </ImageBackground>
    );
  };

  const renderHeaderLeft = (props: any) => {
    return <ProfileAvatar className="mx-4" />;
  };

  const renderHeaderRight = (props: any) => {
    return <Icon as={SearchIcon} size="md" className="mx-4" />;
  };

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '记录',
          headerShown: true,
          headerRight: renderHeaderRight,
          headerLeft: renderHeaderLeft,
        }}
      />
      <VStack className="flex-1 p-4">
        <HStack className="items-center" space="md">
          <Box className="flex-1">
            <FlashList
              data={tags}
              renderItem={renderTagItem}
              estimatedItemSize={42}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            />
          </Box>
          <Box>
            <Link href="https://gluestack.io/" isExternal>
              <HStack className="items-center">
                <LinkText size="sm" className="font-semibold text-info-600 no-underline">
                  全部
                </LinkText>
              </HStack>
            </Link>
          </Box>
        </HStack>
        <FlashList
          data={posts}
          estimatedItemSize={260}
          renderItem={renderPostItem}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        />
      </VStack>
    </SafeAreaView>
  );
};

export default Home;
