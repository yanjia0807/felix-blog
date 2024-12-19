import { useInfiniteQuery } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import { router, Stack } from 'expo-router';
import _ from 'lodash';
import { Activity, MapPin, Star } from 'lucide-react-native';
import moment from 'moment';
import React from 'react';
import { FlatList, ImageBackground, RefreshControl, TouchableOpacity } from 'react-native';
import { apiServerURL, fetchRecommendPosts } from '@/api';
import MainHeader from '@/components/main-header';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

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

const HomeHeader = () => {
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
        className="mx-2 h-48 w-80">
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
    <>
      <MainHeader className="mb-6 h-16" />
      <VStack className="flex-1" space="3xl">
        <FlatList
          data={posts}
          renderItem={renderPostItem}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        />
        <VStack>
          <HStack className="items-center" space="xs">
            <Icon as={Activity} className="text-secondary-950" />
            <Text bold={true} className="my-4 text-secondary-950">
              最近更新
            </Text>
          </HStack>
          <FlatList
            data={users}
            renderItem={renderUserItem}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        </VStack>
        <HStack className="items-center" space="xs">
          <Icon as={Star} className="text-secondary-950" />
          <Text bold={true} className="my-4 text-secondary-950">
            推荐
          </Text>
        </HStack>
      </VStack>
    </>
  );
};

const HomeScreen = () => {
  const {
    data: recommentData,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingRecomment,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: fetchRecommendPosts,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 5,
      },
    },
    getNextPageParam: (lastPage: any) => {
      const {
        meta: {
          pagination: { page, pageSize, pageCount },
        },
      } = lastPage;

      if (page < pageCount) {
        return {
          pagination: { page: page + 1, pageSize },
        };
      }

      return null;
    },
  });

  const renderRecommentItem = ({ item, index }: any) => {
    return (
      <Card variant="elevated" className={`my-6 rounded-lg ${index === 0 ? 'mt-0' : ''}`} size="md">
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: '/posts/[documentId]',
              params: {
                documentId: item.documentId,
              },
            });
          }}>
          <VStack space="lg">
            <HStack className="items-center justify-between" space="md">
              <Box className="w-8">
                <Avatar size="sm">
                  <AvatarFallbackText>
                    {item.author.username || item.author.profile?.nickname}
                  </AvatarFallbackText>
                  <AvatarImage
                    source={{
                      uri: `${apiServerURL}/${item.author.profile?.avatar.formats.thumbnail.url}`,
                    }}
                  />
                </Avatar>
              </Box>
              <VStack className="flex-1">
                <HStack className="items-center justify-between">
                  <Text size="sm" bold={true}>
                    {item.author.username || item.author.profile?.nickname}
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
              <VStack space="md" className="flex-1 justify-between">
                <VStack>
                  <Text numberOfLines={1} bold={true} size="md">
                    {item.title}
                  </Text>
                  <Text numberOfLines={3} size="sm">
                    {item.content}
                  </Text>
                </VStack>

                <Box className="my-6 w-full">
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
                </Box>
              </VStack>
            </HStack>
          </VStack>
        </TouchableOpacity>
      </Card>
    );
  };

  const recomments: any = _.reduce(
    recommentData?.pages,
    (result: any, item: any) => [...result, ...item.data],
    [],
  );

  const isLoading = isLoadingRecomment;

  const renderListHeader = (props: any) => {
    return <HomeHeader {...props}></HomeHeader>;
  };

  return (
    <SafeAreaView className="flex-1 color-background-50">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      {isLoading && (
        <Spinner size="small" className="bg-background absolute bottom-0 left-0 right-0 top-0" />
      )}
      <VStack className="flex-1 px-6">
        <FlatList
          data={recomments}
          ListHeaderComponent={renderListHeader}
          renderItem={renderRecommentItem}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {
                if (!isLoading) {
                  refetch();
                }
              }}
            />
          }
        />
      </VStack>
    </SafeAreaView>
  );
};

export default HomeScreen;
