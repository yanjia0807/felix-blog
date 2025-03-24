import React from 'react';
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
} from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { format } from 'date-fns';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { MapPin } from 'lucide-react-native';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { fetchFeatures, fetchRecommendPosts, fetchPostAuthors } from '@/api';
import { AuthorInfo } from '@/components/auth-context';
import { CommentIcon, CommentProvider, CommentSheet } from '@/components/comment-input';
import { MainHeader } from '@/components/header';
import { LikeButton } from '@/components/like-button';
import PageSpinner from '@/components/page-spinner';
import PostItemMenu from '@/components/post-menu-popover';
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
import { largeSize, thumbnailSize } from '@/utils/file';

interface HomeHeaderProps {
  featureQuery: UseInfiniteQueryResult<InfiniteData<AxiosResponse<any, any>, unknown>, Error>;
  authorQuery: UseInfiniteQueryResult<InfiniteData<AxiosResponse<any, any>, unknown>, Error>;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ featureQuery, authorQuery }) => {
  const router = useRouter();

  const features: any = featureQuery.isLoading
    ? Array(2).fill(undefined)
    : featureQuery.isSuccess
      ? _.reduce(
          featureQuery.data?.pages,
          (result: any, item: any) => [...result, ...item.data],
          [],
        )
      : [];

  const authors: any = authorQuery.isLoading
    ? Array(2).fill(undefined)
    : authorQuery.isSuccess
      ? authorQuery.data
      : [];

  const onFeatureItemPressed = ({ item }: any) => {
    if (item.post) {
      router.push(`/posts/${item.post.documentId}`);
    }
  };

  const renderFeatureItem = ({ item, index }: any) => (
    <Box className={`ml-4 h-48 w-80 ${index === 0 ? 'ml-0' : ''}`}>
      <Skeleton isLoaded={!featureQuery.isLoading} variant="rounded">
        {item && (
          <TouchableOpacity onPress={() => onFeatureItemPressed({ item })}>
            <Image
              recyclingKey={item.assetId}
              source={{
                uri: largeSize(item.image),
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
                              uri: thumbnailSize(item.post.author.avatar),
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
          </TouchableOpacity>
        )}
      </Skeleton>
    </Box>
  );

  const onAvatarPress = ({ item }: any) => router.push(`/users/${item.documentId}`);

  const renderAuthorItem = ({ item, index }: any) => {
    return (
      <TouchableOpacity
        onPress={() => onAvatarPress({ item })}
        className={`ml-4 ${index === 0 ? 'ml-0' : ''}`}>
        <VStack className="items-center" space="xs">
          <Avatar key={item.id} size="md">
            <AvatarFallbackText>{item.username}</AvatarFallbackText>
            <AvatarImage
              source={{
                uri: thumbnailSize(item),
              }}
            />
          </Avatar>
          <Text size="sm">{item.username}</Text>
        </VStack>
      </TouchableOpacity>
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
            if (featureQuery.hasNextPage && !featureQuery.isFetchingNextPage) {
              featureQuery.fetchNextPage();
            }
          }}
        />
        <Box className="h-[94.7]">
          <Skeleton variant="rounded" isLoaded={!authorQuery.isLoading}>
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
  isLoaded: boolean;
}

const RecommentItem: React.FC<RecommentItemProps> = ({ item, index, isLoaded }) => {
  const router = useRouter();

  const onRecommentItemPressed = (documentId: string) => router.push(`/posts/${documentId}`);

  const onAvatarPress = (documentId: string) => router.push(`/users/${documentId}`);

  return (
    <Box className={`mt-6 rounded-lg ${index === 0 ? 'mt-0' : ''}`}>
      <Skeleton variant="rounded" isLoaded={isLoaded}>
        {item && (
          <TouchableOpacity onPress={() => onRecommentItemPressed(item.documentId)}>
            <Card variant="elevated" size="sm">
              <VStack space="lg">
                <VStack space="sm">
                  <TouchableOpacity onPress={() => onAvatarPress(item.author.documentId)}>
                    <HStack className="items-center justify-between">
                      <AuthorInfo author={item.author} />
                      <PostItemMenu post={item} />
                    </HStack>
                  </TouchableOpacity>
                  <Heading numberOfLines={1} ellipsizeMode="tail" bold={true}>
                    {item.title}
                  </Heading>
                  <HStack className="items-center justify-between">
                    <Text size="xs">{formatDistance(item.createdAt)}</Text>
                    <HStack space="xs" className="w-1/2 items-center justify-end">
                      {item.poi?.address && (
                        <HStack className="items-center">
                          <Icon as={MapPin} size="xs" />
                          <Text size="xs" numberOfLines={1}>
                            {item.poi.address}
                          </Text>
                        </HStack>
                      )}
                    </HStack>
                  </HStack>
                  <TagList tags={item.tags} />
                </VStack>
                <Text numberOfLines={5} ellipsizeMode="tail">
                  {item.content}
                </Text>
                <HStack className="h-6 items-center justify-between">
                  <LikeButton post={item} />
                  <UserAvatars users={item.likedByUsers} />
                </HStack>
                <VStack space="sm">
                  <HStack className="items-center justify-end">
                    <CommentIcon item={item} />
                  </HStack>
                  {item.lastComment && (
                    <>
                      <HStack space="md" className="items-center">
                        <Text className="flex-1" size="sm" numberOfLines={3}>
                          {item.lastComment.content}
                        </Text>
                      </HStack>
                      <HStack className="items-center justify-end" space="xs">
                        <HStack className="items-center" space="xs">
                          <HStack className="items-center" space="xs">
                            <Avatar size="xs">
                              <AvatarFallbackText>
                                {item.lastComment.user.username}
                              </AvatarFallbackText>
                              <AvatarImage
                                source={{
                                  uri: thumbnailSize(item.lastComment.user.avatar),
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
          </TouchableOpacity>
        )}
      </Skeleton>
    </Box>
  );
};

const Home: React.FC = () => {
  const recommentQuery = useInfiniteQuery({
    queryKey: ['posts', 'list', 'recomment'],
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

  const featureQuery = useInfiniteQuery({
    queryKey: ['posts', 'list', 'features'],
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

  const authorQuery = useQuery({
    queryKey: ['posts', 'list', 'authors'],
    queryFn: fetchPostAuthors,
  });

  const recomments: any = recommentQuery.isLoading
    ? Array(2).fill(undefined)
    : recommentQuery.isSuccess
      ? _.reduce(
          recommentQuery.data?.pages,
          (result: any, item: any) => [...result, ...item.data],
          [],
        )
      : [];

  const renderRecommentItem = ({ item, index }: any) => (
    <RecommentItem item={item} index={index} isLoaded={!recommentQuery.isLoading} />
  );

  const renderListHeader = (props: any) => (
    <HomeHeader featureQuery={featureQuery} authorQuery={authorQuery} {...props}></HomeHeader>
  );

  const renderEmptyComponent = (props: any) => (
    <Box className="flex-1 items-center justify-center">
      <Text>暂无数据</Text>
    </Box>
  );

  const isLoading = recommentQuery.isLoading || featureQuery.isLoading || authorQuery.isLoading;

  const refetchAll = () => {
    recommentQuery.refetch();
    featureQuery.refetch();
    authorQuery.refetch();
  };

  return (
    <SafeAreaView className="flex-1">
      <PageSpinner isVisiable={recommentQuery.isLoading} />
      <VStack className="flex-1 px-4" space="md">
        <FlatList
          data={recomments}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyComponent}
          renderItem={renderRecommentItem}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (recommentQuery.hasNextPage && !recommentQuery.isFetchingNextPage)
              recommentQuery.fetchNextPage();
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {
                refetchAll();
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
