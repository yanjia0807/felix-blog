import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import { Stack } from 'expo-router';
import { MapPin, Search } from 'lucide-react-native';
import moment from 'moment';
import React from 'react';
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useAuth } from '@/components/auth-context';
import { ProfileAvatar } from '@/components/profile-avatar';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';

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
      avatar: 'https://i.pravatar.cc/150',
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
      avatar: 'https://i.pravatar.cc/150',
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
      avatar: 'https://i.pravatar.cc/150',
    },
    publishedAt: '2024-11-10T08:45:00Z',
    likes: 300,
    unlikes: 3,
    comments: 2,
  },
];

const users = [
  {
    id: 1,
    name: 'Alice',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 2,
    name: 'Bob',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: 3,
    name: 'Charlie',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: 4,
    name: 'David',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    id: 5,
    name: 'Eve',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: 6,
    name: 'Frank',
    avatar: 'https://i.pravatar.cc/150?img=6',
  },
  {
    id: 7,
    name: 'Grace',
    avatar: 'https://i.pravatar.cc/150?img=7',
  },
  {
    id: 8,
    name: 'Hannah',
    avatar: 'https://i.pravatar.cc/150?img=8',
  },
  {
    id: 9,
    name: 'Ivan',
    avatar: 'https://i.pravatar.cc/150?img=9',
  },
  {
    id: 10,
    name: 'Jack',
    avatar: 'https://i.pravatar.cc/150?img=10',
  },
  {
    id: 11,
    name: 'Kim',
    avatar: 'https://i.pravatar.cc/150?img=11',
  },
  {
    id: 12,
    name: 'Laura',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 13,
    name: 'Mike',
    avatar: 'https://i.pravatar.cc/150?img=13',
  },
  {
    id: 14,
    name: 'Nina',
    avatar: 'https://i.pravatar.cc/150?img=14',
  },
  {
    id: 15,
    name: 'Oscar',
    avatar: 'https://i.pravatar.cc/150?img=15',
  },
];

const recomments = [
  {
    id: 201,
    title: '旅行的意义',
    content:
      '旅行不仅是为了远离繁忙的生活，更是一次重新认识自己的机会。今天，我们走进了青藏高原，感受了这片土地的神秘与壮美。',
    cover: 'https://unsplash.it/640/425?random=1',
    author: {
      id: 4,
      name: '张旅行',
      avatar: 'https://i.pravatar.cc/150',
    },
    publishedAt: '2024-11-11T09:00:00Z',
    likes: 210,
    unlikes: 7,
    comments: 4,
  },
  {
    id: 202,
    title: 'AI与未来教育',
    content:
      '人工智能正在改变教育模式，从智能题库到个性化教学，学生们的学习效率得到了显著提升。未来，我们或许可以看到全新的教育体系。',
    cover: 'https://unsplash.it/640/425?random=2',
    author: {
      id: 5,
      name: '科技教育',
      avatar: 'https://i.pravatar.cc/150',
    },
    publishedAt: '2024-11-12T15:45:00Z',
    likes: 180,
    unlikes: 5,
    comments: 3,
  },
  {
    id: 203,
    title: '打造自己的家庭花园',
    content:
      '无论是大院子还是小阳台，一个属于自己的花园总能为生活增添一份宁静与美好。今天，我们分享了家庭花园设计的五个小技巧。',
    cover: 'https://unsplash.it/640/425?random=3',
    author: {
      id: 6,
      name: '园艺爱好者',
      avatar: 'https://i.pravatar.cc/150',
    },
    publishedAt: '2024-11-13T08:30:00Z',
    likes: 95,
    unlikes: 2,
    comments: 1,
  },
  {
    id: 204,
    title: '读书，让心灵充实',
    content:
      '书籍是心灵的食粮，无论是文学小说还是科普读物，每一本书都能带给我们全新的感悟。分享几本近期的好书，让大家一起读起来！',
    cover: 'https://unsplash.it/640/425?random=4',
    author: {
      id: 7,
      name: '阅读达人',
      avatar: 'https://i.pravatar.cc/150',
    },
    publishedAt: '2024-11-14T20:10:00Z',
    likes: 130,
    unlikes: 4,
    comments: 6,
  },
  {
    id: 205,
    title: '摄影技巧大揭秘',
    content:
      '如何拍出专业水准的照片？从光线的运用到构图的选择，每一个细节都至关重要。今天，我们揭开了摄影背后的小技巧。',
    cover: 'https://unsplash.it/640/425?random=5',
    author: {
      id: 8,
      name: '摄影师阿光',
      avatar: 'https://i.pravatar.cc/150',
    },
    publishedAt: '2024-11-15T13:00:00Z',
    likes: 220,
    unlikes: 8,
    comments: 5,
  },
  {
    id: 206,
    title: '探索自然的奇迹',
    content:
      '自然界总是充满了无尽的惊喜，从雨林到沙漠，每一个角落都隐藏着未知的奇迹。今天，我们带你走进地球的神秘一面。',
    cover: 'https://unsplash.it/640/425?random=6',
    author: {
      id: 9,
      name: '自然探索者',
      avatar: 'https://i.pravatar.cc/150',
    },
    publishedAt: '2024-11-16T07:15:00Z',
    likes: 320,
    unlikes: 10,
    comments: 8,
  },
  {
    id: 207,
    title: '如何保持专注力',
    content:
      '在这个信息爆炸的时代，保持专注力变得尤为重要。今天，我们分享了提升专注力的三个小方法，让你高效完成每一天的任务。',
    cover: 'https://unsplash.it/640/425?random=7',
    author: {
      id: 10,
      name: '时间管理者',
      avatar: 'https://i.pravatar.cc/150',
    },
    publishedAt: '2024-11-16T18:30:00Z',
    likes: 170,
    unlikes: 4,
    comments: 2,
  },
  {
    id: 208,
    title: '了解海洋的秘密',
    content:
      '海洋覆盖了地球70%的面积，但我们对它的了解却不到5%。今天，我们深入探索了海洋的神秘世界，感受它的无穷魅力。',
    cover: 'https://unsplash.it/640/425?random=8',
    author: {
      id: 11,
      name: '海洋研究员',
      avatar: 'https://i.pravatar.cc/150',
    },
    publishedAt: '2024-11-17T12:20:00Z',
    likes: 290,
    unlikes: 6,
    comments: 7,
  },
  {
    id: 209,
    title: '音乐的治愈力量',
    content:
      '音乐可以治愈心灵，无论是欢快的旋律还是深情的歌声，都能带给人无尽的力量。分享几首近期治愈系的音乐作品，让大家放松心情。',
    cover: 'https://unsplash.it/640/425?random=9',
    author: {
      id: 12,
      name: '音乐治愈者',
      avatar: 'https://i.pravatar.cc/150',
    },
    publishedAt: '2024-11-18T09:00:00Z',
    likes: 250,
    unlikes: 5,
    comments: 3,
  },
  {
    id: 210,
    title: '探索历史的痕迹',
    content:
      '历史是时间的印记，它记录了人类的过去。今天，我们走访了一座古老的城堡，了解了它背后隐藏的故事与文化价值。',
    cover: 'https://unsplash.it/640/425?random=10',
    author: {
      id: 13,
      name: '历史爱好者',
      avatar: 'https://i.pravatar.cc/150',
    },
    publishedAt: '2024-11-19T08:30:00Z',
    likes: 190,
    unlikes: 3,
    comments: 4,
  },
];

const Home = () => {
  const { user, logout } = useAuth();
  const toast = useCustomToast();
  const dimension = useWindowDimensions();

  const renderTagItem = ({ item }: any) => {
    return (
      <Box className="mx-2 p-2">
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
        style={{
          borderRadius: 16,
        }}
        className="mx-2 h-48 w-80 bg-background-0">
        <Box className="absolute bottom-0 w-full overflow-hidden rounded-2xl">
          <BlurView intensity={10} tint="light" className="p-2">
            <VStack space="md">
              <VStack>
                <Text size="lg" bold={true} className="text-white">
                  {item.title}
                </Text>
                <Text size="sm" className="text-white">
                  {moment(item.publishedAt).format('YYYY-MM-DD')}
                </Text>
              </VStack>

              <HStack className="items-center">
                <Avatar size="sm">
                  <AvatarFallbackText>{item.author.name}</AvatarFallbackText>
                  <AvatarImage
                    source={{
                      uri: item.author.avatar,
                    }}
                  />
                </Avatar>
                <Text size="sm" className="text-white">
                  {item.author.name}
                </Text>
              </HStack>
            </VStack>
          </BlurView>
        </Box>
      </ImageBackground>
    );
  };

  const renderRecommendItem = ({ item }: any) => {
    return (
      <TouchableOpacity onPress={() => {}} className="my-6 rounded-lg bg-background-0 p-4">
        <VStack space="lg">
          <HStack className="items-center justify-between" space="md">
            <Box className="w-8">
              <Avatar size="sm">
                <AvatarFallbackText>{item.author.name}</AvatarFallbackText>
                <AvatarImage
                  source={{
                    uri: `${item.author.avatar}`,
                  }}
                />
              </Avatar>
            </Box>
            <VStack className="flex-1">
              <HStack className="items-center justify-between">
                <Text size="sm" bold={true}>
                  {item.author.name}
                </Text>
                <Text size="xs">30分钟之前</Text>
              </HStack>
              <HStack className="items-center justify-between">
                <HStack space="xs" className="items-center">
                  <Icon as={MapPin} size="xs" />
                  <Text size="xs">重庆市，渝北区</Text>
                </HStack>
              </HStack>
            </VStack>
          </HStack>
          <HStack className="items-start justify-start" space="md">
            <Box className="w-8"></Box>
            <VStack space="md" className="flex-1">
              <Text numberOfLines={1} size="md">
                {item.title}
              </Text>
              <Text numberOfLines={3} size="sm">
                {item.content}
              </Text>
              <HStack className="items-center justify-between">
                <HStack className="items-center">
                  {Array(5)
                    .fill('https://i.pravatar.cc/150')
                    .map((item, index) => (
                      <Avatar
                        key={index}
                        size="xs"
                        style={{
                          position: 'absolute',
                          right: index * 14,
                        }}>
                        <AvatarImage
                          source={{
                            uri: item,
                          }}
                        />
                      </Avatar>
                    ))}
                </HStack>
              </HStack>
            </VStack>
          </HStack>
        </VStack>
      </TouchableOpacity>
    );
  };

  const renderUserItem = ({ item }: any) => {
    return (
      <VStack className="items-center" space="sm">
        <Avatar key={item.id} size="md" className="mx-4">
          <AvatarFallbackText>{item.name}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: item.avatar,
            }}
          />
        </Avatar>
        <Text size="sm">{item.name}</Text>
      </VStack>
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <VStack className="flex-1" space="2xl">
          <HStack className="items-center justify-between ">
            <HStack>
              <Text size="sm">felix</Text>
              <Heading size="3xl">Blog</Heading>
            </HStack>
            <ProfileAvatar className="mx-4" />
          </HStack>
          <VStack className="flex-1" space="xl">
            <FlashList
              data={posts}
              estimatedItemSize={168}
              renderItem={renderPostItem}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            />
            <VStack space="md">
              <Heading size="sm">最近更新</Heading>
              <FlashList
                data={users}
                estimatedItemSize={42}
                renderItem={renderUserItem}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              />
            </VStack>
            <VStack space="md" className="flex-1">
              <Heading size="sm">推荐</Heading>
              <FlashList
                data={recomments}
                renderItem={renderRecommendItem}
                estimatedItemSize={200}
                showsVerticalScrollIndicator={false}
              />
            </VStack>
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
