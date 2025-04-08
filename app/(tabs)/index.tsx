import React, { memo, useState } from 'react';
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
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { fetchBanners, fetchPosts, fetchTags } from '@/api';
import AlbumPagerView from '@/components/album-pager-view';
import { useAuth } from '@/components/auth-provider';
import { CommentIcon, CommentProvider, CommentSheet } from '@/components/comment-input';
import { MainHeader } from '@/components/header';
import { ImageList } from '@/components/image-input';
import { LikeButton } from '@/components/like-button';
import PageSpinner from '@/components/page-spinner';
import {
  PostFilterContent,
  PostFilterIcon,
  PostFilterProvider,
  ResetFilterIcon,
  usePostFilterContext,
} from '@/components/post-filter';
import PostItemMenu from '@/components/post-menu-popover';
import { TagList } from '@/components/tag-input';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { AddIcon, Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { UserAvatar, UserAvatars } from '@/components/user';
import { formatDistance } from '@/utils/date';
import {
  FileTypeNum,
  isImage,
  isVideo,
  largeSize,
  originSize,
  thumbnailSize,
  videoThumbnail,
} from '@/utils/file';

interface HomeHeaderProps {
  bannerQuery: UseInfiniteQueryResult<InfiniteData<AxiosResponse<any, any>, unknown>, Error>;
  tagQuery: UseInfiniteQueryResult<InfiniteData<AxiosResponse<any, any>, unknown>, Error>;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ bannerQuery, tagQuery }) => {
  const router = useRouter();

  const banners: any = bannerQuery.isLoading
    ? Array(2).fill(undefined)
    : bannerQuery.isSuccess
      ? _.reduce(bannerQuery.data?.pages, (result: any, item: any) => [...result, ...item.data], [])
      : [];

  const tags: any = tagQuery.isLoading
    ? Array(2).fill(undefined)
    : tagQuery.isSuccess
      ? tagQuery.data
      : [];

  const onBannerItemPress = ({ item }: any) => {
    if (item.link) {
      if (!item.link.isExternal) {
        router.push(item.link.src);
      }
    }
  };

  const renderBannerItem = ({ item, index }: any) => (
    <Box className={`ml-4 h-48 w-80 ${index === 0 ? 'ml-0' : ''}`}>
      <Skeleton isLoaded={!bannerQuery.isLoading} variant="rounded">
        {item && (
          <TouchableOpacity onPress={() => onBannerItemPress({ item })}>
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
            <Box className="absolute bottom-0 z-10 w-full overflow-hidden rounded-md">
              <BlurView intensity={10} tint="light">
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
                            uri: thumbnailSize(item.author.avatar),
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
            </Box>
          </TouchableOpacity>
        )}
      </Skeleton>
    </Box>
  );

  const renderTagItem = ({ item }: any) => <TagItem item={item} isLoaded={!tagQuery.isLoading} />;

  return (
    <VStack space="xl">
      <MainHeader />
      <FlatList
        data={banners}
        renderItem={renderBannerItem}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        onEndReached={() => {
          if (bannerQuery.hasNextPage && !bannerQuery.isFetchingNextPage) {
            bannerQuery.fetchNextPage();
          }
        }}
      />

      <HStack className="items-center justify-between" space="md">
        <FlatList
          data={tags}
          renderItem={renderTagItem}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        />
        <Divider orientation="vertical" />
        <HStack space="sm">
          <PostFilterIcon />
          <ResetFilterIcon />
        </HStack>
      </HStack>
    </VStack>
  );
};

const TagItem = ({ item, isLoaded }: any) => {
  const { filters, selectTag } = usePostFilterContext();

  return (
    <View className={`mx-1 ${isLoaded ? 'h-auto w-auto' : 'h-8 w-16'}`}>
      <Skeleton isLoaded={isLoaded} variant="rounded">
        {item && (
          <Button
            size="sm"
            action="secondary"
            variant={_.includes(filters.tags, item.id) ? 'solid' : 'outline'}
            onPress={() => selectTag({ item })}>
            <ButtonText>{item.name}</ButtonText>
          </Button>
        )}
      </Skeleton>
    </View>
  );
};

const PostItem: React.FC<any> = memo(
  ({ post, index, isLoaded, setIsPagerOpen, setPagerIndex, setAblum }) => {
    const router = useRouter();
    const cover = post?.cover && {
      id: post.cover.id,
      data: post.cover,
      fileType: FileTypeNum.Image,
      uri: largeSize(post.cover),
      preview: largeSize(post.cover),
    };

    const images = _.map(
      _.filter(post?.attachments || [], (item: any) => isImage(item.mime) || isVideo(item.mime)) ||
        [],
      (item: any) => {
        return isImage(item.mime)
          ? {
              id: item.id,
              data: item,
              fileType: FileTypeNum.Image,
              uri: thumbnailSize(item),
              preview: largeSize(item),
            }
          : {
              id: item.id,
              data: item,
              fileType: FileTypeNum.Video,
              uri: thumbnailSize(item),
              thumbnail: videoThumbnail(item, post?.attachmentExtras),
              preview: originSize(item),
            };
      },
    );

    const album = _.concat(cover ? cover : [], images);

    const onPostItemPressed = ({ item }: any) => router.push(`/posts/${post.documentId}`);

    const onCoverPress = () => {
      setAblum(album);
      setPagerIndex(0);
      setIsPagerOpen(true);
    };

    const onImagePress = (index: number) => {
      setAblum(album);
      setPagerIndex(index + (cover ? 1 : 0));
      setIsPagerOpen(true);
    };

    return (
      <View className={`mt-6 rounded-lg ${index === 0 ? 'mt-0' : ''}`}>
        <Skeleton variant="rounded" isLoaded={isLoaded}>
          {post && (
            <TouchableOpacity onPress={() => onPostItemPressed({ post, index })}>
              <Card variant="elevated" size="sm">
                <VStack space="lg">
                  <VStack space="sm">
                    <HStack className="items-center justify-between">
                      <UserAvatar user={post.author} />
                      <PostItemMenu post={post} />
                    </HStack>
                    <Heading numberOfLines={1} ellipsizeMode="tail" bold={true}>
                      {post.title}
                    </Heading>
                    <HStack className="items-center justify-between">
                      <Text size="xs">{formatDistance(post.createdAt)}</Text>
                      <HStack space="xs" className="w-1/2 items-center justify-end">
                        {post.poi?.address && (
                          <HStack className="items-center">
                            <Icon as={MapPin} size="xs" />
                            <Text size="xs" numberOfLines={1}>
                              {post.poi.address}
                            </Text>
                          </HStack>
                        )}
                      </HStack>
                    </HStack>
                    <TagList tags={post.tags || []}></TagList>
                  </VStack>
                  {cover && (
                    <TouchableOpacity className="h-36 flex-1" onPress={onCoverPress}>
                      <Image
                        source={{
                          uri: cover.uri,
                        }}
                        contentFit="cover"
                        alt={''}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: 8,
                        }}
                      />
                    </TouchableOpacity>
                  )}
                  <Text numberOfLines={5}>{post.content}</Text>
                  <ImageList value={images} onPress={onImagePress} />
                  <HStack className="h-6 items-center justify-between">
                    <LikeButton post={post} />
                    <UserAvatars users={post.likedByUsers} />
                  </HStack>
                  <VStack space="sm">
                    <HStack className="items-center justify-end">
                      <CommentIcon item={post} />
                    </HStack>
                    {post.lastComment && (
                      <>
                        <HStack space="xs" className="items-center">
                          <Text className="flex-1" size="sm" numberOfLines={3}>
                            {post.lastComment.content}
                          </Text>
                        </HStack>
                        <HStack className="items-center justify-end" space="md">
                          <HStack className="items-center" space="xs">
                            <HStack className="items-center" space="xs">
                              <Avatar size="xs">
                                <AvatarFallbackText>
                                  {post.lastComment.user.username}
                                </AvatarFallbackText>
                                <AvatarImage
                                  source={{
                                    uri: thumbnailSize(post.lastComment.user.avatar),
                                  }}
                                />
                              </Avatar>
                              <Text size="sm">{post.lastComment.user.username}</Text>
                            </HStack>
                            <Text size="xs">{formatDistance(post.lastComment.createdAt)}</Text>
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
      </View>
    );
  },
);

const PostList: React.FC = () => {
  const { filters } = usePostFilterContext();
  const [isPagerOpen, setIsPagerOpen] = useState(false);
  const [pagerIndex, setPagerIndex] = useState<number>(0);
  const [album, setAblum] = useState<any>([]);
  const router = useRouter();
  const { user } = useAuth();
  const onPagerClose = () => setIsPagerOpen(false);

  const postQuery = useInfiniteQuery({
    queryKey: ['posts', 'list', filters],
    queryFn: fetchPosts,
    initialPageParam: {
      filters,
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
          filters,
          pagination: { page: page + 1, pageSize },
        };
      }

      return null;
    },
  });

  const bannerQuery = useInfiniteQuery({
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

  const tagQuery = useQuery({
    queryKey: ['tags', 'list'],
    queryFn: fetchTags,
  });

  const posts: any = postQuery.isLoading
    ? Array(2).fill(undefined)
    : postQuery.isSuccess
      ? _.reduce(postQuery.data?.pages, (result: any, item: any) => [...result, ...item.data], [])
      : [];

  const renderListHeader = (props: any) => (
    <HomeHeader bannerQuery={bannerQuery} tagQuery={tagQuery} {...props}></HomeHeader>
  );

  const renderListItem = ({ item, index }: any) => (
    <PostItem
      post={item}
      index={index}
      isLoaded={!postQuery.isLoading}
      setIsPagerOpen={setIsPagerOpen}
      setPagerIndex={setPagerIndex}
      setAblum={setAblum}
    />
  );

  const renderEmptyComponent = (props: any) => (
    <View className="flex-1 items-center justify-center">
      <Text>暂无数据</Text>
    </View>
  );

  const isLoading = postQuery.isLoading || bannerQuery.isLoading || tagQuery.isLoading;

  const refetchAll = () => {
    postQuery.refetch();
    bannerQuery.refetch();
    tagQuery.refetch();
  };

  return (
    <SafeAreaView className="flex-1">
      <PageSpinner isVisiable={isLoading} />
      <VStack className="flex-1 px-4" space="md">
        <FlatList
          data={posts}
          contentContainerClassName="flex-grow"
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyComponent}
          renderItem={renderListItem}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (postQuery.hasNextPage && !postQuery.isFetchingNextPage) postQuery.fetchNextPage();
          }}
          refreshControl={
            <RefreshControl
              refreshing={postQuery.isLoading}
              onRefresh={() => {
                refetchAll();
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
      <AlbumPagerView
        initIndex={pagerIndex}
        value={album}
        isOpen={isPagerOpen}
        onClose={onPagerClose}
      />
    </SafeAreaView>
  );
};

const PostDrawer: React.FC = () => {
  const { isDrawerOpen, setIsDrawerOpen } = usePostFilterContext();
  const renderDrawerContent = () => <PostFilterContent />;

  return (
    <Drawer
      open={isDrawerOpen}
      onOpen={() => setIsDrawerOpen(true)}
      onClose={() => setIsDrawerOpen(false)}
      renderDrawerContent={renderDrawerContent}>
      <PostList />
    </Drawer>
  );
};

const HomePage: React.FC = () => {
  console.log('@render HomePage');

  return (
    <PostFilterProvider>
      <CommentProvider>
        <PostDrawer />
        <CommentSheet />
      </CommentProvider>
    </PostFilterProvider>
  );
};

export default HomePage;
