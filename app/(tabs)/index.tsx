import React, { useCallback } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import _ from 'lodash';
import { MapPin } from 'lucide-react-native';
import { FlatList, Pressable, RefreshControl } from 'react-native';
import { apiServerURL, fetchFeatures, fetchRecommendPosts, fetchPostAuthors } from '@/api';
import { AuthorInfo, useAuth } from '@/components/auth-context';
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
import PostMenuPopover from '@/components/post-menu-popover';

const HomeHeader: React.FC = () => {
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

  const onAvatarPress = (documentId: string) => router.push(`/users/${documentId}`);

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
  isLoaded: boolean;
}

const RecommentItem: React.FC<RecommentItemProps> = ({ item, index, isLoaded }) => {
  const onRecommentItemPressed = (documentId: string) => router.push(`/posts/${documentId}`);

  const onAvatarPress = (documentId: string) => router.push(`/users/${documentId}`);

  return (
    <Box className={`mt-6 rounded-lg ${index === 0 ? 'mt-0' : ''}`}>
      <Skeleton variant="rounded" isLoaded={isLoaded}>
        {item && (
          <Pressable
            onPress={() => onRecommentItemPressed(item.documentId)}
            pointerEvents="box-none">
            <Card variant="elevated" size="md">
              <VStack space="lg">
                <VStack space="sm">
                  <Pressable onPress={() => onAvatarPress(item.author.documentId)}>
                    <HStack className="items-center justify-between">
                      <AuthorInfo author={item.author} />
                      <PostMenuPopover post={item} />
                    </HStack>
                  </Pressable>
                  <Heading numberOfLines={1} ellipsizeMode="tail" bold={true}>
                    {item.title}
                  </Heading>
                  <HStack className="items-center justify-between">
                    <Text size="xs">{formatDistance(item.createdAt)}</Text>
                    <HStack space="xs" className="items-center justify-end">
                      {item.poi?.address && (
                        <HStack className="items-center">
                          <Icon as={MapPin} size="xs" />
                          <Text size="xs">{item.poi.address}</Text>
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
    </Box>
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
    <RecommentItem item={item} index={index} isLoaded={!isLoadingRecomment} />
  );

  const renderListHeader = (props: any) => <HomeHeader {...props}></HomeHeader>;

  const renderEmptyComponent = (props: any) => (
    <Box className="flex-1 items-center justify-center">
      <Text>暂无数据</Text>
    </Box>
  );

  return (
    <SafeAreaView className="flex-1">
      <PageSpinner isVisiable={isLoadingRecomment} />
      <VStack className="flex-1 px-4" space="md">
        <FlatList
          data={recomments}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyComponent}
          renderItem={renderRecommentItem}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingRecomment}
              onRefresh={() => {
                if (!isLoadingRecomment) refetch();
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
