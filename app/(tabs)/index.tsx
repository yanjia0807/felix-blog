import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { Filter, MapPin, Search } from 'lucide-react-native';
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
import { fetchBanners, fetchPosts } from '@/api';
import { useAuth } from '@/components/auth-provider';
import { CommentIcon, CommentProvider, CommentSheet } from '@/components/comment-input';
import { PageFallbackUI } from '@/components/fallback';
import { MainHeader } from '@/components/header';
import { ImageCover, ImageList, VideoCover } from '@/components/image-input';
import { LikeButton } from '@/components/like-button';
import PageSpinner from '@/components/page-spinner';
import { PagerViewProvider, usePagerView } from '@/components/pager-view';
import PostItemMenu from '@/components/post-menu-popover';
import { usePreferences } from '@/components/preferences-provider';
import { TagList } from '@/components/tag-input';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { AddIcon, Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { UserAvatar, UserAvatars } from '@/components/user';
import useCoverDimensions from '@/hooks/use-cover-dimensions';
import { formatDistance } from '@/utils/date';
import {
  FileTypeNum,
  isImage,
  isVideo,
  imageFormat,
  fileFullUrl,
  videoThumbnailUrl,
} from '@/utils/file';

const CommentItem: React.FC<any> = ({ item }) => {
  return (
    <>
      <HStack space="xs" className="items-center">
        <Text className="flex-1" size="sm" numberOfLines={3}>
          {item.content}
        </Text>
      </HStack>
      <HStack className="items-center justify-end" space="md">
        <HStack className="items-center" space="xs">
          <HStack className="items-center" space="xs">
            <Avatar size="xs">
              <AvatarFallbackText>{item.user.username}</AvatarFallbackText>
              <AvatarImage
                source={{
                  uri: imageFormat(item.user.avatar, 's', 't')?.fullUrl,
                }}
              />
            </Avatar>
            <Text size="sm">{item.user.username}</Text>
          </HStack>
          <Text size="xs">{formatDistance(item.createdAt)}</Text>
        </HStack>
      </HStack>
    </>
  );
};

export const PostItem: React.FC<any> = memo(
  ({ item }) => {
    useEffect(() => console.log('@render PostItem'));

    const router = useRouter();
    const { coverWidth, coverHeight } = useCoverDimensions(14, 10.5);
    const { setPages, onOpenPage } = usePagerView();

    const onCoverPress = () => {
      setPages(item.album);
      onOpenPage(0);
    };

    const onImagePress = (index: number) => {
      setPages(item.album);
      onOpenPage(index + (item.cover ? 1 : 0));
    };

    return (
      <Pressable onPress={() => router.push(`/posts/${item.documentId}`)}>
        <Card size="sm" className="mt-6 rounded-lg">
          <VStack space="lg">
            <VStack space="sm">
              <HStack className="items-center justify-between">
                <UserAvatar user={item.author} />
                <PostItemMenu post={item} />
              </HStack>
              <Heading numberOfLines={1} ellipsizeMode="tail" bold={true}>
                {item.title}
              </Heading>
              <HStack className="items-center justify-between">
                <Text size="xs">{formatDistance(item.publishDate)}</Text>
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
              <TagList tags={item.tags || []}></TagList>
            </VStack>
            {item.cover && isImage(item.cover.mime) && (
              <ImageCover
                item={item}
                width={coverWidth}
                height={coverHeight}
                onPress={onCoverPress}
              />
            )}
            {item.cover && isVideo(item.cover.mime) && (
              <VideoCover
                item={item}
                width={coverWidth}
                height={coverHeight}
                onPress={onCoverPress}
              />
            )}
            <Text numberOfLines={5}>{item.content}</Text>
            <ImageList value={item.mediaList} onPress={onImagePress} />
            <HStack className="h-6 items-center justify-between">
              <LikeButton post={item} />
              <UserAvatars users={item.likedByUsers} />
            </HStack>
            <VStack space="sm">
              <HStack className="items-center justify-end">
                <CommentIcon post={item} />
              </HStack>
              {item.lastComment && <CommentItem item={item.lastComment} />}
            </VStack>
          </VStack>
        </Card>
      </Pressable>
    );
  },
  (prev, next) => {
    return (
      _.isEqual(prev.item.documentId, next.item.documentId) &&
      _.isEqual(prev.item.title, next.item.title) &&
      _.isEqual(prev.item.content, next.item.content) &&
      _.isEqual(prev.item.comments.count, next.item.comments.count) &&
      _.isEqual(prev.item.likedByUsers, next.item.likedByUsers) &&
      _.isEqual(prev.item.poi?.id, next.item.poi?.id) &&
      _.isEqual(prev.item.cover?.id, next.item.cover?.id) &&
      _.isEqual(prev.item.author?.id, next.item.author?.id) &&
      _.isEqual(prev.item.lastComment?.id, next.item.lastComment?.id) &&
      _.isEqual(prev.item.publishedAt?.id, next.item.publishedAt?.id) &&
      _.isEqual(prev.item.attachments, next.item.attachments) &&
      _.isEqual(prev.item.attachmentExtras, next.item.attachmentExtras)
    );
  },
);

const PostSkeleton: React.FC<any> = () => (
  <VStack className="mt-6 w-full rounded-lg bg-background-100 p-2" space="lg">
    <HStack className="items-center justify-between">
      <HStack className="w-24 items-center" space="xs">
        <Skeleton variant="circular" className="h-8 w-8" />
        <SkeletonText _lines={1} className="h-4" />
      </HStack>
      <Skeleton variant="sharp" className="h-4 w-24" />
    </HStack>
    <SkeletonText _lines={2} className="h-3" />
    <Skeleton variant="rounded" className="h-52" />
    <SkeletonText _lines={3} className="h-3" />
    <HStack className="items-center" space="sm">
      <Skeleton variant="rounded" className="h-14 w-14" />
      <Skeleton variant="rounded" className="h-14 w-14" />
    </HStack>
  </VStack>
);

const HomeHeader: React.FC<any> = memo(({ autocompleteRef }) => {
  useEffect(() => console.log('@render HomeHeader'));

  const router = useRouter();
  const { theme } = usePreferences();

  const bannersQuery = useInfiniteQuery({
    queryKey: ['banners', 'list'],
    queryFn: fetchBanners,
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

  const banners: any = bannersQuery.isLoading
    ? Array(2).fill(undefined)
    : bannersQuery.isSuccess
      ? _.reduce(
          bannersQuery.data?.pages,
          (result: any, item: any) => [...result, ...item.data],
          [],
        )
      : [];

  const onItemPress = ({ item }: any) => {
    if (item.link) {
      if (!item.link.isExternal) {
        router.push(item.link.src);
      }
    }
  };

  const renderItem = ({ item, index }: any) => (
    <View className={`ml-4 h-48 w-80 ${index === 0 ? 'ml-0' : ''}`}>
      <Skeleton isLoaded={!bannersQuery.isLoading} variant="rounded">
        {item && (
          <TouchableOpacity onPress={() => onItemPress({ item })}>
            <Image
              recyclingKey={item.assetId}
              source={{
                uri: imageFormat(item.image, 'l')?.fullUrl,
              }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 6,
              }}
            />
            <View className="absolute bottom-0 w-full rounded-md">
              <BlurView intensity={10} tint={theme === 'light' ? 'light' : 'dark'}>
                <VStack space="md" className="p-2">
                  <Text size="lg" bold={true} className="text-white" numberOfLines={2}>
                    {item.title}
                  </Text>
                  <HStack className="items-center justify-between">
                    <Text size="sm" className="text-white">
                      {format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}
                    </Text>
                    <HStack space="xs" className="items-center">
                      <Avatar size="sm">
                        <AvatarFallbackText>{item.author.username}</AvatarFallbackText>
                        <AvatarImage
                          source={{
                            uri: imageFormat(item.author, 's', 't')?.fullUrl,
                          }}
                        />
                      </Avatar>
                      <Text size="sm" className="text-white">
                        {item.author.username}
                      </Text>
                    </HStack>
                  </HStack>
                </VStack>
              </BlurView>
            </View>
          </TouchableOpacity>
        )}
      </Skeleton>
    </View>
  );

  const onEndReached = () => {
    if (bannersQuery.hasNextPage && !bannersQuery.isFetchingNextPage) {
      bannersQuery.fetchNextPage();
    }
  };

  return (
    <VStack space="xl">
      <MainHeader />

      <TouchableOpacity onPress={() => router.push('/posts/search')}>
        <Input
          size="lg"
          variant="rounded"
          className="w-full"
          isReadOnly={true}
          pointerEvents="none">
          <InputSlot className="ml-3">
            <InputIcon as={Search} />
          </InputSlot>
          <InputField placeholder="搜索帖子..." />
          <InputSlot className="mx-3">
            <InputIcon as={Filter} />
          </InputSlot>
        </Input>
      </TouchableOpacity>
      <FlatList
        data={banners}
        renderItem={renderItem}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        onEndReached={onEndReached}
      />
    </VStack>
  );
});

const PostList: React.FC<any> = () => {
  const router = useRouter();
  const { user } = useAuth();

  const postsQuery = useInfiniteQuery({
    queryKey: ['posts', 'list'],
    queryFn: fetchPosts,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 10,
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

  const posts: any = useMemo(() => {
    if (postsQuery.isLoading) {
      return _.map(new Array(3), () => ({ documentId: _.uniqueId(), placeholder: true }));
    } else if (postsQuery.isSuccess) {
      return _.map(
        _.flatMap(postsQuery.data.pages, (page: any) => page.data),
        (item: any) => {
          {
            const cover = !item.cover
              ? undefined
              : isImage(item.cover.mime)
                ? {
                    ...item.cover,
                    fileType: FileTypeNum.Image,
                    uri: fileFullUrl(item.cover),
                    thumbnail: imageFormat(item.cover, 's', 's')?.fullUrl,
                    preview: imageFormat(item.cover, 'l')?.fullUrl,
                  }
                : {
                    ...item.cover,
                    fileType: FileTypeNum.Video,
                    uri: fileFullUrl(item.cover),
                    thumbnail: videoThumbnailUrl(item.cover, item.attachmentExtras),
                    preview: fileFullUrl(item.cover),
                  };

            const mediaList = _.map(
              _.filter(
                item.attachments || [],
                (item: any) => isImage(item.mime) || isVideo(item.mime),
              ),
              (image: any) => {
                return isImage(image.mime)
                  ? {
                      ...image,
                      fileType: FileTypeNum.Image,
                      uri: fileFullUrl(image),
                      thumbnail: imageFormat(image, 's', 's')?.fullUrl,
                      preview: imageFormat(image, 'l')?.fullUrl,
                    }
                  : {
                      ...image,
                      fileType: FileTypeNum.Video,
                      uri: fileFullUrl(image),
                      thumbnail: videoThumbnailUrl(image, item.attachmentExtras),
                      preview: fileFullUrl(image),
                    };
              },
            );

            const album = _.concat(cover ? cover : [], mediaList);

            return {
              ...item,
              cover,
              mediaList,
              album,
            };
          }
        },
      );
    } else {
      return [];
    }
  }, [postsQuery.data, postsQuery.isLoading, postsQuery.isSuccess]);

  const renderListHeader = useCallback((props: any) => {
    return <HomeHeader {...props}></HomeHeader>;
  }, []);

  const renderListItem = ({ item, index }: any) =>
    item.placeholder ? <PostSkeleton /> : <PostItem item={item} />;

  const renderEmptyComponent = (props: any) => (
    <View className="mt-32 flex-1 items-center">
      <Text>暂无数据</Text>
    </View>
  );

  const onEndReached = () => {
    if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) postsQuery.fetchNextPage();
  };

  return (
    <SafeAreaView className="flex-1">
      {postsQuery.isLoading && <PageSpinner />}
      <VStack className="flex-1 px-4" space="md">
        <FlatList
          data={posts}
          contentContainerClassName="flex-grow"
          keyExtractor={(item) => item.documentId}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyComponent}
          renderItem={renderListItem}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReached}
          refreshControl={
            <RefreshControl
              refreshing={postsQuery.isLoading}
              onRefresh={() => {
                if (postsQuery.hasNextPage && !postsQuery.isLoading) {
                  postsQuery.refetch();
                }
              }}
            />
          }
        />
      </VStack>
      {user && (
        <Fab size="md" placement="bottom right" onPress={() => router.push('/posts/create')}>
          <FabIcon as={AddIcon} />
          <FabLabel>发帖</FabLabel>
        </Fab>
      )}
    </SafeAreaView>
  );
};

const HomePage: React.FC<any> = () => {
  useEffect(() => console.log('@render HomePage'));

  return (
    <CommentProvider>
      <PagerViewProvider>
        <PostList />
        <CommentSheet />
      </PagerViewProvider>
    </CommentProvider>
  );
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default HomePage;
