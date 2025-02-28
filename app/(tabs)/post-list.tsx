import React, { memo, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import _ from 'lodash';
import { MapPin } from 'lucide-react-native';
import { FlatList, RefreshControl } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import GalleryPreview from 'react-native-gallery-preview';
import { apiServerURL, fetchPosts, fetchTags } from '@/api';
import { AuthorInfo, useAuth } from '@/components/auth-context';
import { CommentIcon, CommentProvider, CommentSheet } from '@/components/comment-input';
import { ImageList } from '@/components/image-input';
import { LikeButton } from '@/components/like-button';
import MainHeader from '@/components/main-header';
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
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import UserAvatars from '@/components/user-avatars';
import { formatDistance } from '@/utils/date';

interface PostItemProps {
  item: any;
  index: number;
  isLoaded: boolean;
  setGallery: any;
  setIsGalleryOpen: any;
}

const PostTagItem = ({ item, isLoaded }: any) => {
  // console.log('@@PostTagItem');
  const { filters, selectTag } = usePostFilterContext();

  return (
    <Button
      size="sm"
      action="secondary"
      variant={_.includes(filters.tags, item.id) ? 'solid' : 'outline'}
      className="mx-2"
      onPress={() => selectTag({ item })}>
      <ButtonText>{item.name}</ButtonText>
    </Button>
  );
};

const PostHeader: React.FC = () => {
  console.log('@@PostHeader');
  const { isSuccess, data: tags } = useQuery({
    queryKey: ['tags', 'list'],
    queryFn: fetchTags,
  });

  const renderItem = ({ item }: any) => <PostTagItem item={item} isLoaded={isSuccess} />;

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

const PostItem: React.FC<PostItemProps> = memo(
  ({ item, index, isLoaded, setGallery, setIsGalleryOpen }) => {
    console.log('@@PostItem');

    const cover = item?.cover
      ? {
          ...item.cover,
          uri: `${apiServerURL}${item.cover.formats?.large?.url || item.cover.url}`,
          largeUri: `${apiServerURL}${item.cover.formats?.large?.url || item.cover.url}`,
        }
      : undefined;

    const images = _.map(
      _.find(item?.attachments || [], { type: 'image' })?.files || [],
      (item: any) => ({
        ...item,
        uri: `${apiServerURL}${item.formats?.thumbnail.url}`,
        largeUri: `${apiServerURL}${item.formats?.large?.url || item.url}`,
      }),
    );

    const galleryImages = _.concat(
      [],
      cover
        ? {
            ...cover,
            uri: cover.largeUri || cover.uri,
            cover: true,
          }
        : [],
      images
        ? images.map((item: any) => ({
            ...item,
            uri: item.largeUri || item.uri,
            cover: false,
          }))
        : [],
    );

    const onSetGallery = (index?: number) => {
      setGallery({
        images: galleryImages,
        index,
      });
      setIsGalleryOpen(true);
    };

    const onPostItemPressed = ({ item }: any) => router.push(`/posts/${item.documentId}`);

    return (
      <Box className={`mt-6 rounded-lg ${index === 0 ? 'mt-0' : ''}`}>
        <Skeleton variant="rounded" isLoaded={isLoaded}>
          {item && (
            <Pressable onPress={() => onPostItemPressed({ item, index })} pointerEvents="box-none">
              <Card variant="elevated">
                <VStack space="lg">
                  <VStack space="sm">
                    <HStack className="items-center justify-between">
                      <AuthorInfo author={item.author} />
                      <PostItemMenu post={item} />
                    </HStack>
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
                    <TagList tags={item.tags || []}></TagList>
                  </VStack>
                  {cover && (
                    <Pressable className="h-36 flex-1" onPress={() => onSetGallery(0)}>
                      <Image
                        source={{
                          uri: cover.uri,
                        }}
                        contentFit="cover"
                        alt={cover.alternativeText}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: 8,
                        }}
                      />
                    </Pressable>
                  )}
                  <Text numberOfLines={5}>{item.content}</Text>
                  <ImageList
                    value={images}
                    galleryInitIndex={cover ? 1 : 0}
                    onSetGallery={onSetGallery}
                  />
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
                        <HStack space="xs" className="items-center">
                          <Text className="flex-1" size="sm" numberOfLines={3}>
                            {item.lastComment.content}
                          </Text>
                        </HStack>
                        <HStack className="items-center justify-end" space="md">
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
  },
);

const PostList = function PostList() {
  console.log('@@PostList');

  const { user } = useAuth();
  const { filters } = usePostFilterContext();
  const [gallery, setGallery] = useState<any>({
    images: [],
    index: 0,
  });
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const {
    data: postData,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isSuccess,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['posts', 'list', filters],
    queryFn: fetchPosts,
    initialPageParam: {
      filters,
      pagination: {
        page: 1,
        pageSize: 20,
      },
    },
    getNextPageParam: (lastPage: any) => {
      const {
        meta: {
          filters,
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

  const posts: any = isSuccess
    ? _.reduce(postData?.pages, (result: any, item: any) => [...result, ...item.data], [])
    : Array(5).fill(undefined);

  const renderPostItem = ({ item, index }: any) => (
    <PostItem
      item={item}
      index={index}
      isLoaded={!isLoading}
      setGallery={setGallery}
      setIsGalleryOpen={setIsGalleryOpen}
    />
  );

  const renderPostHeader = (props: any) => <PostHeader {...props} />;

  const renderEmptyComponent = () => (
    <Box className="flex-1 items-center justify-center">
      <Text>暂无数据</Text>
    </Box>
  );

  const onCreatePostButtonPressed = () => router.push('/posts/create');

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
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {
                if (!isLoading) refetch();
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
      <GalleryPreview
        images={gallery.images}
        initialIndex={gallery.index}
        isVisible={isGalleryOpen}
        onRequestClose={() => setIsGalleryOpen(false)}
      />
      <CommentSheet />
    </>
  );
};

const PostListDrawer: React.FC = () => {
  console.log('@@Drawer');
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

const PostListPage: React.FC = () => (
  <SafeAreaView className="flex-1">
    <PostFilterProvider>
      <CommentProvider>
        <PostListDrawer />
      </CommentProvider>
    </PostFilterProvider>
  </SafeAreaView>
);

export default PostListPage;
