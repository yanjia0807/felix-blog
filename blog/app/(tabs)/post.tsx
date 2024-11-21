import React from 'react';
import { router, Stack } from 'expo-router';
import { Fab, FabLabel, FabIcon } from '@/components/ui/fab';
import { AddIcon, Icon } from '@/components/ui/icon';
import { FlashList } from '@shopify/flash-list';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { fetchPosts } from '@/api';
import { VStack } from '@/components/ui/vstack';
import { ProfileAvatar } from '@/components/profile-avatar';
import { Spinner } from '@/components/ui/spinner';
import colors from 'tailwindcss/colors';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { MapPin } from 'lucide-react-native';
import { RefreshControl, TouchableOpacity } from 'react-native';
import PostThumbnail from '@/components/post-thumbnail';
import LikePostButton from '@/components/like-post-button';
import CommentInfo from '@/components/comment-info';
import AuthorInfo from '@/components/author-info';
import useCustomToast from '@/components/use-custom-toast';
import _ from 'lodash';
import { useInfiniteQuery } from '@tanstack/react-query';
import PostMenuPopover from '@/components/post-menu-popover';

const PostHome = () => {
  const toast = useCustomToast();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    initialPageParam: {
      pagination: {
        start: 0,
        limit: 10,
      },
    },
    getNextPageParam: (lastPage: any) => {
      const {
        meta: {
          pagination: { limit, start, total },
        },
      } = lastPage;

      if (start + limit >= total) {
        return null;
      }

      return {
        pagination: { limit, start: start + limit },
      };
    },
  });

  const posts: any = _.reduce(
    data?.pages,
    (result: any, item: any) => [...result, ...item.data],
    [],
  );

  const renderPostItem = ({ item }: any) => {
    return (
      <Card className="mb-6 rounded-lg p-5">
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: '/posts/[documentId]',
              params: {
                documentId: item.documentId,
              },
            });
          }}>
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
            <Text numberOfLines={3}>{item.content}</Text>
            <PostThumbnail item={item} />
            <HStack className="items-center justify-between">
              <HStack space="lg" className="flex-row items-center">
                <LikePostButton post={item} />
                <CommentInfo post={item} />
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
        </TouchableOpacity>
      </Card>
    );
  };

  const renderHeaderLeft = (props: any) => {
    return <ProfileAvatar className="mx-4" />;
  };

  if (status === 'pending') {
    return (
      <Spinner
        size="small"
        className="absolute bottom-0 left-0 right-0 top-0"
        color={colors.gray[500]}
      />
    );
  }

  if (status === 'error') {
    toast.error('获取数据异常');
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '记录',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <VStack className="flex-1 p-4" space="md">
        <FlashList
          data={posts}
          renderItem={renderPostItem}
          estimatedItemSize={200}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          refreshControl={
            <RefreshControl
              colors={['#9Bd35A', '#689F38']}
              refreshing={isLoading}
              onRefresh={() => {
                if (!isLoading) {
                  refetch();
                }
              }}
            />
          }
        />
        <Fab
          size="md"
          placement="bottom right"
          onPress={() => {
            router.push('/posts/create');
          }}>
          <FabIcon as={AddIcon} />
          <FabLabel>记录</FabLabel>
        </Fab>
      </VStack>
    </>
  );
};

export default PostHome;
