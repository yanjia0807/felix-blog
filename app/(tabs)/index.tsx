import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
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
import {
  FlatList,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { fetchBanners, fetchPosts, fetchAllTags } from '@/api';
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
import { usePreferences } from '@/components/preferences-provider';
import { TagList } from '@/components/tag-input';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { AddIcon, Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
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
  imageFormat,
  fileFullUrl,
  videoThumbnailUrl,
} from '@/utils/file';

const CONTAINER_PADDING = 14;
const CARD_PADDING = 10.5;

interface HomeHeaderProps {
  bannersQuery: UseInfiniteQueryResult<InfiniteData<AxiosResponse<any, any>, unknown>, Error>;
  tagsQuery: UseInfiniteQueryResult<InfiniteData<AxiosResponse<any, any>, unknown>, Error>;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ bannersQuery, tagsQuery }) => {
  const router = useRouter();
  const { theme } = usePreferences();

  const banners: any = bannersQuery.isLoading
    ? Array(2).fill(undefined)
    : bannersQuery.isSuccess
      ? _.reduce(
          bannersQuery.data?.pages,
          (result: any, item: any) => [...result, ...item.data],
          [],
        )
      : [];

  const tags: any = tagsQuery.isLoading
    ? Array(2).fill(undefined)
    : tagsQuery.isSuccess
      ? tagsQuery.data
      : [];

  const onBannerItemPress = ({ item }: any) => {
    if (item.link) {
      if (!item.link.isExternal) {
        router.push(item.link.src);
      }
    }
  };

  const renderBannerItem = ({ item, index }: any) => (
    <View className={`ml-4 h-48 w-80 ${index === 0 ? 'ml-0' : ''}`}>
      <Skeleton isLoaded={!bannersQuery.isLoading} variant="rounded">
        {item && (
          <TouchableOpacity onPress={() => onBannerItemPress({ item })}>
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
            <View className="absolute bottom-0 z-10 w-full overflow-hidden rounded-md">
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

  const renderTagItem = ({ item }: any) => <TagItem item={item} isLoaded={!tagsQuery.isLoading} />;

  return (
    <VStack space="xl">
      <MainHeader />
      <FlatList
        data={banners}
        renderItem={renderBannerItem}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        onEndReached={() => {
          if (bannersQuery.hasNextPage && !bannersQuery.isFetchingNextPage) {
            bannersQuery.fetchNextPage();
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

const TagItem: React.FC<any> = ({ item, isLoaded }) => {
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

export const ImageCover: React.FC<any> = ({ item }) => {
  const { width: screenWidth } = useWindowDimensions();

  const format = imageFormat(item.cover, 'l', 's');
  const aspectRadio = format.width / format.height;
  const width = screenWidth - CONTAINER_PADDING * 2 - CARD_PADDING * 2;
  const height = Math.min(Math.max(width / aspectRadio, (width / 4) * 3), (width / 16) * 9);

  return (
    <Image
      source={{
        uri: item.cover.thumbnail,
      }}
      contentFit="cover"
      style={{
        width,
        height,
        borderRadius: 6,
      }}
    />
  );
};

export const VideoCover: React.FC<any> = ({ item }) => {
  const { width: screenWidth } = useWindowDimensions();
  const width = screenWidth - CONTAINER_PADDING * 2 - CARD_PADDING * 2;
  const height = (width / 16) * 9;

  return (
    <View className="flex-1 items-center justify-center">
      <Image
        source={{
          uri: item.cover.thumbnail,
        }}
        contentFit="cover"
        style={{
          width,
          height,
          borderRadius: 6,
        }}
      />
      <View className="absolute">
        <Ionicons name="play-circle-outline" size={42} className="opacity-50" color="white" />
      </View>
    </View>
  );
};

export const PostItem: React.FC<any> = ({
  item,
  index,
  setIsPagerOpen,
  setPagerIndex,
  setAblum,
}) => {
  const router = useRouter();

  const onPostItemPressed = ({ item }: any) => router.push(`/posts/${item.documentId}`);

  const onCoverPress = () => {
    setAblum(item.album);
    setPagerIndex(0);
    setIsPagerOpen(true);
  };

  const onImagePress = (index: number) => {
    setAblum(item.album);
    setPagerIndex(index + (item.cover ? 1 : 0));
    setIsPagerOpen(true);
  };

  return (
    <Pressable onPress={() => onPostItemPressed({ item, index })}>
      <Card size="sm" className={`mt-6 rounded-lg`}>
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
            <TagList tags={item.tags || []}></TagList>
          </VStack>
          {item.cover && (
            <TouchableOpacity onPress={onCoverPress}>
              {isImage(item.cover.mime) ? <ImageCover item={item} /> : <VideoCover item={item} />}
            </TouchableOpacity>
          )}
          <Text numberOfLines={5}>{item.content}</Text>
          <ImageList value={item.mediaList} onPress={onImagePress} />
          <HStack className="h-6 items-center justify-between">
            <LikeButton post={item} />
            <UserAvatars users={item.likedByUsers} />
          </HStack>
          <VStack space="sm">
            <HStack className="items-center justify-end">
              <CommentIcon item={item} />
            </HStack>
            {item.lastComment && <CommentItem item={item.lastComment} />}
          </VStack>
        </VStack>
      </Card>
    </Pressable>
  );
};

const PostList: React.FC<any> = () => {
  const { filters } = usePostFilterContext();
  const [isPagerOpen, setIsPagerOpen] = useState(false);
  const [pagerIndex, setPagerIndex] = useState<number>(0);
  const [album, setAblum] = useState<any>([]);
  const router = useRouter();
  const { user } = useAuth();

  const onPagerClose = () => setIsPagerOpen(false);

  const postsQuery = useInfiniteQuery({
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

  const tagsQuery = useQuery({
    queryKey: ['tags', 'list'],
    queryFn: fetchAllTags,
  });

  const posts: any = postsQuery.isSuccess
    ? _.reduce(
        postsQuery.data?.pages,
        (result: any, page: any) => [
          ...result,
          ...page.data.map((item: any) => {
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
          }),
        ],
        [],
      )
    : [];

  const renderListHeader = (props: any) => (
    <HomeHeader bannersQuery={bannersQuery} tagsQuery={tagsQuery} {...props}></HomeHeader>
  );

  const renderListItem = ({ item, index }: any) => (
    <PostItem
      item={item}
      index={index}
      isLoaded={!postsQuery.isLoading}
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

  const isLoading = postsQuery.isLoading || bannersQuery.isLoading || tagsQuery.isLoading;

  const refetchAll = () => {
    postsQuery.refetch();
    bannersQuery.refetch();
    tagsQuery.refetch();
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
            if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage)
              postsQuery.fetchNextPage();
          }}
          refreshControl={
            <RefreshControl
              refreshing={postsQuery.isLoading}
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

const PostDrawer: React.FC<any> = () => {
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

const HomePage: React.FC<any> = () => {
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
