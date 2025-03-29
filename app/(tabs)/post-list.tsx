import React, { memo, useState } from 'react';
import { useInfiniteQuery, useQuery, UseQueryResult } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import _ from 'lodash';
import { MapPin } from 'lucide-react-native';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { fetchPosts, fetchTags } from '@/api';
import AlbumPagerView from '@/components/album-pager-view';
import { useAuth } from '@/components/auth-provider';
import { CommentIcon, CommentProvider, CommentSheet } from '@/components/comment-input';
import { HeaderLogo, MainHeader } from '@/components/header';
import { ImageList } from '@/components/image-input';
import { LikeButton } from '@/components/like-button';
import PageSpinner from '@/components/page-spinner';
import {
  PostFilterIcon,
  PostFilterContent,
  PostFilterProvider,
  usePostFilterContext,
  ResetFilterIcon,
} from '@/components/post-filter';
import PostItemMenu from '@/components/post-menu-popover';
import { TagList } from '@/components/tag-input';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Fab, FabLabel, FabIcon } from '@/components/ui/fab';
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

const PostTagItem = ({ item, isLoaded }: any) => {
  const { filters, selectTag } = usePostFilterContext();

  return (
    <Box className={`mx-1 ${isLoaded ? 'h-auto w-auto' : 'h-8 w-16'}`}>
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
    </Box>
  );
};

interface PostHeaderProps {
  tagQuery: UseQueryResult<any, Error>;
}

const PostHeader: React.FC<PostHeaderProps> = ({ tagQuery }) => {
  const renderItem = ({ item }: any) => <PostTagItem item={item} isLoaded={!tagQuery.isLoading} />;

  const tags: any = tagQuery.isLoading
    ? Array(2).fill(undefined)
    : tagQuery.isSuccess
      ? tagQuery.data
      : [];

  return (
    <VStack className="h-32">
      <MainHeader />
      <VStack className="flex-1" space="md">
        <HStack className="items-center justify-between" space="md">
          <FlatList
            data={tags}
            renderItem={renderItem}
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
    </VStack>
  );
};

const PostItem: React.FC<any> = memo(
  ({ post, index, isLoaded, setIsPagerOpen, setPagerIndex, setAblum }) => {
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
      <Box className={`mt-6 rounded-lg ${index === 0 ? 'mt-0' : ''}`}>
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
      </Box>
    );
  },
);

const PostList = function PostList() {
  const { user } = useAuth();
  const { filters } = usePostFilterContext();
  const [isPagerOpen, setIsPagerOpen] = useState(false);
  const [pagerIndex, setPagerIndex] = useState<number>(0);
  const [album, setAblum] = useState<any>([]);
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

  const tagQuery = useQuery({
    queryKey: ['tags', 'list'],
    queryFn: fetchTags,
  });

  const posts: any = postQuery.isLoading
    ? Array(2).fill(undefined)
    : postQuery.isSuccess
      ? _.reduce(postQuery.data?.pages, (result: any, item: any) => [...result, ...item.data], [])
      : [];

  const renderPostItem = ({ item, index }: any) => (
    <PostItem
      post={item}
      index={index}
      isLoaded={!postQuery.isLoading}
      setIsPagerOpen={setIsPagerOpen}
      setPagerIndex={setPagerIndex}
      setAblum={setAblum}
    />
  );

  const renderPostHeader = (props: any) => <PostHeader tagQuery={tagQuery} {...props} />;

  const renderEmptyComponent = () => (
    <Box className="flex-1 items-center justify-center">
      <Text>暂无数据</Text>
    </Box>
  );

  const onCreatePostButtonPressed = () => router.push('/posts/create');

  const isLoading = postQuery.isLoading || tagQuery.isLoading;

  const refetchAll = () => {
    postQuery.refetch();
    tagQuery.refetch();
  };

  return (
    <>
      <VStack className="flex-1 px-4">
        <PageSpinner isVisiable={isLoading} />
        <FlatList
          contentContainerClassName="flex-grow"
          data={posts}
          ListHeaderComponent={renderPostHeader}
          ListEmptyComponent={renderEmptyComponent}
          renderItem={renderPostItem}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onEndReached={() => {
            if (postQuery.hasNextPage && !postQuery.isFetchingNextPage) postQuery.fetchNextPage();
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {
                if (!isLoading) refetchAll();
              }}
            />
          }
        />
        {user && (
          <Fab size="md" placement="bottom right" onPress={() => onCreatePostButtonPressed()}>
            <FabIcon as={AddIcon} />
            <FabLabel>帖子</FabLabel>
          </Fab>
        )}
      </VStack>
      <AlbumPagerView
        initIndex={pagerIndex}
        value={album}
        isOpen={isPagerOpen}
        onClose={onPagerClose}
      />
      <CommentSheet />
    </>
  );
};

const PostListDrawer: React.FC = () => {
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

const PostListPage: React.FC = () => {
  return (
    <SafeAreaView className="flex-1">
      <PostFilterProvider>
        <CommentProvider>
          <PostListDrawer />
        </CommentProvider>
      </PostFilterProvider>
    </SafeAreaView>
  );
};

export default PostListPage;
