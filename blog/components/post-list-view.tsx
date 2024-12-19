import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import _ from 'lodash';
import { MapPin, Heart, BookMarked, MessageCircle } from 'lucide-react-native';
import React from 'react';
import { RefreshControl, TouchableOpacity } from 'react-native';
import { fetchUserPosts } from '@/api';
import { Box } from './ui/box';
import { Card } from './ui/card';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

const PostListView = ({ user }: any) => {
  const { data, error, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['posts', { user: user.documentId }],
      queryFn: fetchUserPosts,
      initialPageParam: {
        pagination: {
          page: 1,
          pageSize: 5,
        },
        userDocumentId: user.documentId,
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
            userDocumentId: user.documentId,
          };
        }

        return null;
      },
    });

  const posts: any = _.reduce(
    data?.pages,
    (result: any, item: any) => [...result, ...item.data],
    [],
  );

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: '/posts/[documentId]',
            params: {
              documentId: item.documentId,
            },
          });
        }}>
        <Card className="my-3 rounded-lg p-4">
          <VStack space="lg">
            <HStack className="items-start justify-start" space="md">
              <VStack space="md" className="flex-1">
                <Heading numberOfLines={1} size="md">
                  {item.title}
                </Heading>
                <HStack className="items-center justify-between">
                  <Text size="xs">30分钟之前</Text>
                  <HStack space="xs" className="items-center">
                    <Icon as={MapPin} size="xs" />
                    <Text size="xs">重庆市，渝北区</Text>
                  </HStack>
                </HStack>
                <Text numberOfLines={3} size="sm">
                  {item.content}
                </Text>
              </VStack>
            </HStack>
            <HStack className="items-center justify-end" space="md">
              <HStack space="lg" className="flex-row items-center">
                <HStack space="xs" className="items-center">
                  <Icon as={Heart} />
                  <Text size="xs">{item?.likedByUsers?.count}</Text>
                </HStack>
                <HStack space="xs" className="items-center">
                  <Icon as={MessageCircle} />
                  <Text size="xs">{item?.comments?.count}</Text>
                </HStack>
              </HStack>
            </HStack>
          </VStack>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = (props: any) => {
    return (
      <Box className="mt-10 w-full items-center justify-center">
        <Text size="sm">没有数据</Text>
      </Box>
    );
  };

  return (
    <Box className="flex-1">
      {user ? (
        <FlashList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.documentId}
          estimatedItemSize={154}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={renderEmptyComponent}
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
      ) : (
        <></>
      )}
    </Box>
  );
};

export default PostListView;
