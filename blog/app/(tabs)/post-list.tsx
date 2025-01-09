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
import { CommentIcon } from '@/components/comment-input';
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
import { Avatar, AvatarImage } from '@/components/ui/avatar';
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
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatDistance } from '@/utils/date';

const PostHeader = () => {
  const { isLoading, data } = useQuery({
    queryKey: ['tags', 'list'],
    queryFn: fetchTags,
  });

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

  const renderTagsItem = ({ item }: any) => {
    return (
      <Pressable onPress={() => onTagItemPress(item)}>
        <Badge size="lg" variant="outline" className="mx-2 rounded">
          <BadgeText>{item.name}</BadgeText>
          {_.includes(filters.tags, item.id) && <BadgeIcon as={Check} className="ml-2" />}
        </Badge>
      </Pressable>
    );
  };

  return (
    <VStack className="mb-4">
      <MainHeader className="mb-6" />
      <VStack className="flex-1" space="md">
        <HStack className="items-center" space="md">
          <FlatList
            data={data}
            renderItem={renderTagsItem}
            horizontal={true}
            keyExtractor={(item: any) => item.documentId}
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

const PostList = () => {
  const { user } = useAuth();
  const {
    filters,
    setFilters,
    data: postData,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
  } = usePostFilterDrawerContext();

  const posts: any = _.reduce(
    postData?.pages,
    (result: any, item: any) => [...result, ...item.data],
    [],
  );

  const renderPostItem = ({ item, index }: any) => {
    const images = _.map(
      _.find(item.attachments || [], { type: 'image' })?.files || [],
      (item: any) => ({
        id: item.id,
        assetId: item.documentId,
        alternativeText: item.alternativeText,
        thumbnailUri: `${apiServerURL}${item.formats?.thumbnail.url}`,
        uri: `${apiServerURL}${item.formats?.medium.url}`,
      }),
    );

    return (
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
            <VStack space="sm">
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
          <HStack className="items-center justify-between">
            <HStack space="lg" className="flex-row items-center">
              <LikeButton post={item} />
              <CommentIcon count={item.comments.count} />
            </HStack>
            <HStack className="items-center">
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
            </HStack>
          </HStack>
        </VStack>
      </Card>
    );
  };

  const renderPostHeader = (props: any) => {
    return <PostHeader {...props}></PostHeader>;
  };

  const onPostItemPressed = ({ item }: any) => {
    router.push({
      pathname: '/posts/[documentId]',
      params: {
        documentId: item.documentId,
      },
    });
  };

  const onCreatePostButtonPressed = () => {
    router.push('/posts/create');
  };

  return (
    <>
      {isLoading ? (
        <Spinner size="small" className="absolute bottom-0 left-0 right-0 top-0" />
      ) : (
        <VStack className="flex-1 px-4">
          <FlatList
            data={posts}
            initialNumToRender={5}
            ListHeaderComponent={renderPostHeader}
            renderItem={renderPostItem}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item: any) => item.documentId}
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
      )}
    </>
  );
};

const PostListDrawer = () => {
  const { isDrawerOpen, setIsDrawerOpen } = usePostFilterDrawerContext();

  return (
    <Drawer
      open={isDrawerOpen}
      onOpen={() => setIsDrawerOpen(true)}
      onClose={() => setIsDrawerOpen(false)}
      renderDrawerContent={() => <PostFilterContent />}>
      <PostList />
    </Drawer>
  );
};

const PostListPage = () => (
  <SafeAreaView className="flex-1">
    <PostFilterDrawerProvider>
      <PostListDrawer />
    </PostFilterDrawerProvider>
  </SafeAreaView>
);

export default PostListPage;
