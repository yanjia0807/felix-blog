import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import _ from 'lodash';
import { MapPin } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { FlatList, Pressable, RefreshControl } from 'react-native';
import { apiServerURL, fetchFeatures, fetchRecommendPosts, fetchPostAuthors } from '@/api';
import { useAuth } from '@/components/auth-context';
import { CommentIcon, CommentProvider, CommentSheet } from '@/components/comment-input';
import { LikeButton } from '@/components/like-button';
import MainHeader from '@/components/main-header';
import PageSpinner from '@/components/page-spinner';
import { TagList } from '@/components/tag-input';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import UserAvatars from '@/components/user-avatars';
import { formatDistance } from '@/utils/date';

const HomeHeader: React.FC = () => {
  const { user } = useAuth();

  const {
    data: featureData,
    fetchNextPage,
    hasNextPage,
    isSuccess: isLoadFeaturesSuccess,
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

  const features: any = isLoadFeaturesSuccess
    ? _.reduce(featureData?.pages, (result: any, item: any) => [...result, ...item.data], [])
    : Array(2).fill(undefined);

  const { data: authorsData, isSuccess: isLoadAuthorsSuccess } = useQuery({
    queryKey: ['posts', 'list', 'authors'],
    queryFn: fetchPostAuthors,
  });

  const authors = isLoadAuthorsSuccess ? authorsData : Array(2).fill(undefined);

  const onFeatureItemPressed = ({ post }: any) => {
    if (post) {
      router.push(`/posts/${post.documentId}`);
    }
  };

  const renderFeatureItem = ({ item, index }: any) => (
    <Box className={`ml-4 h-48 w-80 ${index === 0 ? 'ml-0' : ''}`}>
      <Skeleton isLoaded={isLoadFeaturesSuccess} variant="rounded">
        {item && (
          <Pressable onPress={() => onFeatureItemPressed(item)}>
            <Image
              recyclingKey={item.assetId}
              source={{
                uri: `${apiServerURL}${item.image?.formats.medium.url}`,
              }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 8,
              }}
            />
            {item.post && (
              <Box className="absolute bottom-0 z-10 w-full overflow-hidden rounded-md">
                <BlurView intensity={10} tint="light">
                  <VStack space="md" className="p-2">
                    <Text size="lg" bold={true} className="text-white" numberOfLines={2}>
                      {item.post.title}
                    </Text>
                    <HStack className="items-center justify-between">
                      <Text size="sm" className="text-white">
                        {format(item.post.createdAt, 'yyyy-MM-dd HH:mm:ss')}
                      </Text>
                      <HStack space="xs" className="items-center">
                        <Avatar size="sm">
                          <AvatarFallbackText>{item.post.author.username}</AvatarFallbackText>
                          <AvatarImage
                            source={{
                              uri: `${apiServerURL}${item.post.author.avatar?.formats.thumbnail.url}`,
                            }}
                          />
                        </Avatar>
                        <Text size="sm" className="text-white">
                          {item.post.author.username}
                        </Text>
                      </HStack>
                    </HStack>
                  </VStack>
                </BlurView>
              </Box>
            )}
          </Pressable>
        )}
      </Skeleton>
    </Box>
  );

  const onAvatarPress = (documentId: string) => {
    if (user?.documentId === documentId) {
      router.push('/profile');
    } else {
      router.push(`/users/${documentId}`);
    }
  };

  const renderAuthorItem = ({ item, index }: any) => {
    return (
      <Pressable
        onPress={() => onAvatarPress(item.documentId)}
        className={`ml-4 ${index === 0 ? 'ml-0' : ''}`}>
        <VStack className="items-center" space="xs">
          <Avatar key={item.id} size="md">
            <AvatarFallbackText>{item.username}</AvatarFallbackText>
            <AvatarImage
              source={{
                uri: `${apiServerURL}${item.formats.thumbnail.url}`,
              }}
            />
          </Avatar>
          <Text size="sm">{item.username}</Text>
        </VStack>
      </Pressable>
    );
  };

  return (
    <VStack space="xl" className="mb-10">
      <MainHeader />
      <VStack space="xl">
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
        <Box className="h-[94.7]">
          <Skeleton variant="rounded" isLoaded={isLoadAuthorsSuccess}>
            <VStack space="md">
              <Text bold={true}>最近更新</Text>
              <FlatList
                data={authors}
                renderItem={renderAuthorItem}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              />
            </VStack>
          </Skeleton>
        </Box>
      </VStack>
    </VStack>
  );
};

interface RecommentItemProps {
  item: any;
  index: any;
  isLoading: boolean;
}

const RecommentItem: React.FC<RecommentItemProps> = ({ item, index, isLoading }) => {
  const { user } = useAuth();

  const onRecommentItemPressed = (documentId: string) => router.push(`/posts/${documentId}`);

  const onAvatarPress = (documentId: string) => {
    if (user?.documentId === documentId) {
      router.push('/profile');
    } else {
      router.push(`/users/${documentId}`);
    }
  };

  return (
    <Skeleton
      className={`my-6 h-52 rounded-lg ${index === 0 ? 'mt-0' : ''}`}
      variant="rounded"
      isLoaded={!isLoading}>
      {item && (
        <Pressable onPress={() => onRecommentItemPressed(item.documentId)} pointerEvents="box-none">
          <Card
            variant="elevated"
            className={`my-6 rounded-lg ${index === 0 ? 'mt-0' : ''}`}
            size="md">
            <VStack space="lg">
              <HStack space="lg" className="items-center justify-between">
                <Pressable onPress={() => onAvatarPress(item.author.documentId)}>
                  <HStack className="items-center" space="sm">
                    <Avatar size="md">
                      <AvatarFallbackText>{item.author.username}</AvatarFallbackText>
                      <AvatarImage
                        source={{
                          uri: `${apiServerURL}${item.author.avatar?.formats.thumbnail.url}`,
                        }}
                      />
                    </Avatar>
                    <Text size="sm">{item.author.username}</Text>
                  </HStack>
                </Pressable>
                <VStack className="items-end">
                  <Text size="xs">{formatDistance(item.createdAt)}</Text>
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
                <VStack space="lg" className="flex-1 justify-between">
                  <Heading numberOfLines={1} ellipsizeMode="tail" bold={true}>
                    {item.title}
                  </Heading>
                  <TagList tags={item.tags} />
                  <Text numberOfLines={5} ellipsizeMode="tail">
                    {item.content}
                  </Text>
                </VStack>
              </HStack>
              <HStack className="h-6 items-center justify-between">
                <LikeButton post={item} />
                <UserAvatars users={item.likedByUsers} />
              </HStack>
              <VStack space="md" className="mt-6">
                <HStack className="items-center justify-end" space="sm">
                  <CommentIcon item={item} />
                </HStack>
                {item.lastComment && (
                  <>
                    <HStack space="md" className="items-center">
                      <Text className="flex-1" size="sm" numberOfLines={2}>
                        {item.lastComment.content}
                      </Text>
                    </HStack>
                    <HStack className="items-center justify-end" space="md">
                      <HStack className="items-center" space="md">
                        <HStack className="items-center" space="xs">
                          <Avatar size="xs">
                            <AvatarFallbackText>
                              {item.lastComment.user.username}
                            </AvatarFallbackText>
                            <AvatarImage
                              source={{
                                uri: `${apiServerURL}${item.lastComment.user.avatar?.formats.thumbnail.url}`,
                              }}
                            />
                          </Avatar>
                          <Text size="sm">{item.lastComment.user.username}</Text>
                        </HStack>
                        <Text size="xs">{formatDistance(item.lastComment.createdAt)}</Text>
                      </HStack>
                    </HStack>
                  </>
                )}
              </VStack>
            </VStack>
          </Card>
        </Pressable>
      )}
    </Skeleton>
  );
};

const Home: React.FC = () => {
  const {
    data: recommentData,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingRecomment,
    isSuccess: isLoadRecommentSuccess,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['posts', 'list', 'recomment'],
    queryFn: fetchRecommendPosts,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 20,
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

  const recomments: any = isLoadRecommentSuccess
    ? _.reduce(recommentData?.pages, (result: any, item: any) => [...result, ...item.data], [])
    : Array(2).fill(undefined);

  const renderRecommentItem = ({ item, index }: any) => (
    <RecommentItem item={item} index={index} isLoading={isLoadingRecomment} />
  );

  const renderListHeader = useCallback((props: any) => <HomeHeader {...props}></HomeHeader>, []);

  const renderEmptyComponent = useCallback(
    (props: any) => (
      <Box className="flex-1 items-center justify-center">
        <Text>暂无数据</Text>
      </Box>
    ),
    [],
  );

  return (
    <SafeAreaView className="flex-1">
      <PageSpinner isVisiable={isLoadingRecomment} />
      <VStack className="flex-1 px-4">
        <FlatList
          data={recomments}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyComponent}
          renderItem={renderRecommentItem}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingRecomment}
              onRefresh={() => {
                if (!isLoadingRecomment) {
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

const HomePage: React.FC = () => (
  <CommentProvider>
    <Home />
    <CommentSheet />
  </CommentProvider>
);

export default HomePage;
