import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import _ from 'lodash';
import { MapPin } from 'lucide-react-native';
import React from 'react';
import { FlatList, Pressable, RefreshControl } from 'react-native';
import { apiServerURL, fetchFeatures, fetchRecommendPosts, fetchRecentAuthors } from '@/api';
import { useAuth } from '@/components/auth-context';
import MainHeader from '@/components/main-header';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatDistance } from '@/utils/date';

const HomeHeader: React.FC = () => {
  const { user } = useAuth();

  const {
    data: featureData,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingFeatures,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['features', 'list'],
    queryFn: fetchFeatures,
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

  const features: any = _.reduce(
    featureData?.pages,
    (result: any, item: any) => [...result, ...item.data],
    [],
  );

  const { data: recentAuthors, isLoading: isLoadingRecentAuthors } = useQuery({
    queryKey: ['authors', 'recent'],
    queryFn: fetchRecentAuthors,
  });

  const onFeatureItemPressed = ({ post: { documentId } }: any) => {
    router.push({
      pathname: '/posts/[documentId]',
      params: {
        documentId,
      },
    });
  };

  const onAvatarPress = (documentId: string) => {
    if (user?.documentId === documentId) {
      router.push('/profile');
    } else {
      router.push(`/users/${documentId}`);
    }
  };

  const renderFeatureItem = ({ item }: any) => {
    return (
      <Pressable className="mx-2 h-48 w-80" onPress={() => onFeatureItemPressed(item)}>
        <Image
          recyclingKey={item.assetId}
          source={{
            uri: `${apiServerURL}${item.image.formats.medium.url}`,
          }}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 8,
          }}
          className="h-full w-full"
        />
        <Box className="absolute bottom-0 z-10 w-full overflow-hidden rounded-md">
          <BlurView intensity={10} tint="light" className="p-2">
            <VStack space="md">
              <VStack>
                <Text size="lg" bold={true} className="text-white">
                  {item.post?.title}
                </Text>
              </VStack>
              <HStack className="items-center justify-between">
                <Text size="sm" className="text-white">
                  {format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}
                </Text>
                <HStack space="xs" className="items-center">
                  <Avatar size="sm">
                    <AvatarImage
                      source={{
                        uri: `${apiServerURL}${item.post?.author.avatar?.formats.thumbnail.url}`,
                      }}
                    />
                    <AvatarFallbackText>{item.post?.author.username}</AvatarFallbackText>
                  </Avatar>
                  <Text size="sm" className="text-white">
                    {item.post?.author.username}
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </BlurView>
        </Box>
      </Pressable>
    );
  };

  const renderRecentAuthorItem = ({ item }: any) => {
    return (
      <Pressable onPress={() => onAvatarPress(item.documentId)}>
        <VStack className="items-center" space="sm">
          <Avatar key={item.id} size="md" className="mx-4">
            <AvatarImage
              source={{
                uri: `${apiServerURL}${item.formats.thumbnail.url}`,
              }}
            />
            <AvatarFallbackText>{item.username}</AvatarFallbackText>
          </Avatar>
          <Text size="sm">{item.username}</Text>
        </VStack>
      </Pressable>
    );
  };

  return (
    <VStack className="h-[400]">
      <MainHeader className="mb-6" />
      <VStack space="2xl">
        <FlatList
          data={features}
          renderItem={renderFeatureItem}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
        />
        <VStack>
          <HStack className="items-center" space="xs">
            <Text bold={true} className="my-4 text-secondary-950">
              最近更新
            </Text>
          </HStack>
          <FlatList
            data={recentAuthors}
            renderItem={renderRecentAuthorItem}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        </VStack>
      </VStack>
    </VStack>
  );
};

const Home: React.FC = () => {
  const { user } = useAuth();

  const {
    data: recommentData,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingRecomment,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['posts', 'recomment'],
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

  const onAvatarPress = (documentId: string) => {
    if (user?.documentId === documentId) {
      router.push('/profile');
    } else {
      router.push(`/users/${documentId}`);
    }
  };

  const onRecommentItemPressed = ({ item, index }: any) => {
    router.push({
      pathname: '/posts/[documentId]',
      params: {
        documentId: item.documentId,
      },
    });
  };

  const renderRecommentItem = ({ item, index }: any) => {
    return (
      <Pressable onPress={() => onRecommentItemPressed({ item, index })}>
        <Card className={`my-6 rounded-lg ${index === 0 ? 'mt-0' : ''}`} size="md">
          <VStack space="lg">
            <HStack className="items-center justify-between" space="md">
              <Pressable className="w-8" onPress={() => onAvatarPress(item.author.documentId)}>
                <Avatar size="sm">
                  <AvatarImage
                    source={{
                      uri: `${apiServerURL}${item.author.avatar?.formats.thumbnail.url}`,
                    }}
                  />
                  <AvatarFallbackText>{item.author.username}</AvatarFallbackText>
                </Avatar>
              </Pressable>
              <VStack className="flex-1">
                <HStack className="items-center justify-between">
                  <Text size="sm" bold={true}>
                    {item.author.username}
                  </Text>
                  <Text size="xs">{formatDistance(item.createdAt)}</Text>
                </HStack>
                <HStack space="xs" className="items-center">
                  {item.poi?.address && (
                    <>
                      <Icon as={MapPin} size="xs" />
                      <Text size="xs">{item.poi.address}</Text>
                    </>
                  )}
                </HStack>
              </VStack>
            </HStack>
            <HStack className="items-start justify-start" space="md">
              <Box className="w-8"></Box>
              <VStack space="lg" className="flex-1 justify-between">
                <VStack>
                  <Heading numberOfLines={1} ellipsizeMode="tail" bold={true}>
                    {item.title}
                  </Heading>
                  <Text numberOfLines={3} ellipsizeMode="tail">
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
        </Card>
      </Pressable>
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
    <SafeAreaView className="flex-1">
      {isLoading ? (
        <Spinner size="small" className="bg-background absolute bottom-0 left-0 right-0 top-0" />
      ) : (
        <VStack className="flex-1 px-4">
          <FlatList
            data={recomments}
            ListHeaderComponent={renderListHeader}
            renderItem={renderRecommentItem}
            showsVerticalScrollIndicator={false}
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
      )}
    </SafeAreaView>
  );
};

export default Home;
