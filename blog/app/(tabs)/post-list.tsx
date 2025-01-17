import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import _ from 'lodash';
import { Check, Eraser, MapPin } from 'lucide-react-native';
import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { apiServerURL, fetchTags } from '@/api';
import { useAuth } from '@/components/auth-context';
import AuthorInfo from '@/components/author-info';
import {
  CommentListInput,
  CommentProvider,
  CommentSheet,
  useCommentContext,
} from '@/components/comment-input';
import { ImageList } from '@/components/image-input';
import { LikeButton } from '@/components/like-button';
import MainHeader from '@/components/main-header';
import {
  PostFilter,
  PostFilterContent,
  PostFilterDrawerProvider,
  usePostFilterDrawerContext,
} from '@/components/post-filter';
import PostMenuPopover from '@/components/post-menu-popover';
import { TagList } from '@/components/tag-input';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Fab, FabLabel, FabIcon } from '@/components/ui/fab';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { AddIcon, Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import UserAvatars from '@/components/user-avatars';
import { formatDistance } from '@/utils/date';

const PostHeader: React.FC = () => {
  const { isSuccess, data } = useQuery({
    queryKey: ['tags', 'list'],
    queryFn: fetchTags,
  });

  const tags = isSuccess ? data : Array(5).fill(undefined);
  const { filters, setFilters, clearFilters } = usePostFilterDrawerContext();

  const onTagItemPress = (item: any) => {
    if (_.includes(filters.tags, item.id)) {
      setFilters((val: any) => ({
        ...val,
        tags: _.filter([...val.tags], (val: any) => val !== item.id),
      }));
    } else {
      setFilters((val: any) => ({ ...val, tags: [...val.tags, item.id] }));
    }
  };

  const renderTagsItem = ({ item }: any) => (
    <Skeleton className="mx-2 h-7 w-20" isLoaded={isSuccess} variant="rounded">
      {item && (
        <Pressable onPress={() => onTagItemPress(item)} className="mx-2">
          <Badge size="lg" variant="outline" className="rounded">
            <BadgeText>{item.name}</BadgeText>
            {_.includes(filters.tags, item.id) && <BadgeIcon as={Check} className="ml-2" />}
          </Badge>
        </Pressable>
      )}
    </Skeleton>
  );

  return (
    <VStack className="mb-4">
      <MainHeader className="mb-6" />
      <VStack className="flex-1" space="md">
        <HStack className="items-center" space="md">
          <FlatList
            data={tags}
            renderItem={renderTagsItem}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
          <Divider orientation="vertical" />
          <HStack space="sm">
            <PostFilter />
            <Button variant="link" action="secondary" onPress={() => clearFilters()}>
              <ButtonIcon as={Eraser} />
            </Button>
          </HStack>
        </HStack>
      </VStack>
    </VStack>
  );
};

const PostList: React.FC = () => {
  const { user } = useAuth();
  const {
    data: postData,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isSuccess,
    isFetchingNextPage,
    refetch,
  } = usePostFilterDrawerContext();
  const { setPostDocumentId, setCommentCount } = useCommentContext();

  const posts: any = isSuccess
    ? _.reduce(postData?.pages, (result: any, item: any) => [...result, ...item.data], [])
    : Array(5).fill(undefined);

  const renderPostItem = ({ item, index }: any) => {
    const images = item
      ? _.map(_.find(item.attachments || [], { type: 'image' })?.files || [], (item: any) => ({
          id: item.id,
          assetId: item.documentId,
          alternativeText: item.alternativeText,
          thumbnailUri: `${apiServerURL}${item.formats?.thumbnail.url} || ${apiServerURL}${item.url}`,
          uri: `${apiServerURL}${item.url}`,
        }))
      : [];

    return (
      <Skeleton className={`my-6 rounded-lg p-5 ${index === 0 ? 'mt-0' : ''}`} isLoaded={isSuccess}>
        {item && (
          <Card variant="elevated" className={`my-6 rounded-lg p-5 ${index === 0 ? 'mt-0' : ''}`}>
            <VStack space="xl">
              <VStack space="sm">
                <HStack className="items-center justify-between">
                  <AuthorInfo author={item.author} />
                  <PostMenuPopover post={item} />
                </HStack>
                <HStack className="items-center justify-between">
                  <Text size="xs">{formatDistance(item.createdAt)}</Text>
                  <HStack space="xs" className="items-center">
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
              <Pressable onPress={() => onPostItemPressed({ item, index })}>
                <VStack space="md">
                  <Heading numberOfLines={2}>{item.title}</Heading>
                  {item.cover && (
                    <Box className="h-36 flex-1">
                      <Image
                        source={{
                          uri: `${apiServerURL}${item.cover.formats?.medium.url}`,
                        }}
                        contentFit="cover"
                        alt={item.cover.alternativeText}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: 8,
                        }}
                      />
                    </Box>
                  )}
                  <Text numberOfLines={3}>{item.content}</Text>
                </VStack>
              </Pressable>
              <ImageList images={images} />
              <HStack className="h-6 items-center justify-between">
                <HStack space="lg" className="flex-row items-center">
                  <LikeButton post={item} />
                  <CommentListInput
                    onPress={() => onCommentInputPress({ item })}
                    commentCount={item.comments.count}
                  />
                </HStack>
                <UserAvatars users={item.likedByUsers} />
              </HStack>
            </VStack>
          </Card>
        )}
      </Skeleton>
    );
  };

  const renderPostHeader = (props: any) => {
    return <PostHeader {...props}></PostHeader>;
  };

  const onPostItemPressed = ({ item }: any) => router.push(`/posts/${item.documentId}`);

  const onCommentInputPress = ({ item }: any) => {
    setPostDocumentId(item.documentId);
    setCommentCount(item.comments.count);
  };

  const onCreatePostButtonPressed = () => {
    router.push('/posts/create');
  };

  return (
    <VStack className="flex-1 px-4">
      {isLoading && (
        <Spinner
          size="small"
          className="bg-background absolute bottom-0 left-0 right-0 top-0 z-10"
        />
      )}
      <FlatList
        data={posts}
        ListHeaderComponent={renderPostHeader}
        renderItem={renderPostItem}
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
      {user && (
        <Fab size="md" placement="bottom right" onPress={() => onCreatePostButtonPressed()}>
          <FabIcon as={AddIcon} />
          <FabLabel>帖子</FabLabel>
        </Fab>
      )}
    </VStack>
  );
};

const PostListDrawer: React.FC = () => {
  const { isDrawerOpen, setIsDrawerOpen } = usePostFilterDrawerContext();

  return (
    <Drawer
      open={isDrawerOpen}
      onOpen={() => setIsDrawerOpen(true)}
      onClose={() => setIsDrawerOpen(false)}
      renderDrawerContent={() => <PostFilterContent />}>
      <CommentProvider>
        <PostList />
        <CommentSheet />
      </CommentProvider>
    </Drawer>
  );
};

const PostListPage: React.FC = () => (
  <SafeAreaView className="flex-1">
    <PostFilterDrawerProvider>
      <PostListDrawer />
    </PostFilterDrawerProvider>
  </SafeAreaView>
);

export default PostListPage;
