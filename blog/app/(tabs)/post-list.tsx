import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import _ from 'lodash';
import { MapPin, Search } from 'lucide-react-native';
import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { fetchPosts, fetchTags } from '@/api';
import { useAuth } from '@/components/auth-context';
import AuthorInfo from '@/components/author-info';
import { CommentInput } from '@/components/comment-input';
import { LikeButton } from '@/components/like-button';
import MainHeader from '@/components/main-header';
import PostMenuPopover from '@/components/post-menu-popover';
import PostThumbnail from '@/components/post-thumbnail';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Fab, FabLabel, FabIcon } from '@/components/ui/fab';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { AddIcon, Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const PostHeader = ({ tags }: any) => {
  const renderTagsItem = ({ item }: any) => {
    return (
      <Button action="secondary" className="mx-2">
        <ButtonText>{item.name}</ButtonText>
      </Button>
    );
  };

  return (
    <VStack className="h-[180]">
      <MainHeader className="mb-6" />
      <VStack className="flex-1" space="2xl">
        <HStack>
          <Input className="flex-1 bg-primary-100" variant="rounded">
            <InputField placeholder="搜索帖子..." />
            <InputSlot>
              <InputIcon as={Search} className="mx-2"></InputIcon>
            </InputSlot>
          </Input>
        </HStack>
        <HStack className="h-12 w-full">
          <FlatList
            data={tags}
            renderItem={renderTagsItem}
            horizontal={true}
            keyExtractor={(item: any) => item.documentId}
            showsHorizontalScrollIndicator={false}
          />
        </HStack>
      </VStack>
    </VStack>
  );
};

const PostList = () => {
  const { user } = useAuth();

  const {
    data: postData,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingPost,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
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

  const posts: any = _.reduce(
    postData?.pages,
    (result: any, item: any) => [...result, ...item.data],
    [],
  );

  const { isLoading: isLoadingTag, data: tags } = useQuery({
    queryKey: ['tags', 'list'],
    queryFn: fetchTags,
  });

  const renderPostItem = ({ item, index }: any) => {
    return (
      <Pressable onPress={() => onPostItemPressed({ item, index })}>
        <Card variant="elevated" className={`my-6 rounded-lg p-5 ${index === 0 ? 'mt-0' : ''}`}>
          <VStack space="md">
            <HStack className="items-center justify-between">
              <AuthorInfo author={item.author} />
              <PostMenuPopover post={item} />
            </HStack>
            <HStack className="items-center justify-between">
              <Text size="xs">30分钟之前</Text>
              <HStack space="xs" className="items-center">
                <Icon as={MapPin} size="xs" />
                <Text size="xs">重庆市，渝北区</Text>
              </HStack>
            </HStack>
            <Heading numberOfLines={2}>{item.title}</Heading>
            <Text numberOfLines={3}>{item.content}</Text>
            <PostThumbnail item={item} />
            <HStack className="items-center justify-between">
              <HStack space="lg" className="flex-row items-center">
                <LikeButton post={item} />
                <CommentInput postDocumentId={item.documentId} count={item.comments.count} />
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
      </Pressable>
    );
  };

  const renderPostHeader = (props: any) => {
    return <PostHeader tags={tags} {...props}></PostHeader>;
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

  const isLoading = isLoadingPost || isLoadingTag;

  return (
    <SafeAreaView className="flex-1">
      {isLoading && <Spinner size="small" className="absolute bottom-0 left-0 right-0 top-0" />}
      <VStack className="flex-1 px-6">
        <FlatList
          data={posts}
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
              refreshing={isLoadingPost}
              onRefresh={() => {
                if (!isLoading) {
                  refetch();
                }
              }}
            />
          }
        />
      </VStack>
      {user && (
        <Fab size="md" placement="bottom right" onPress={() => onCreatePostButtonPressed()}>
          <FabIcon as={AddIcon} />
          <FabLabel>帖子</FabLabel>
        </Fab>
      )}
    </SafeAreaView>
  );
};

export default PostList;
