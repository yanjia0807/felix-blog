import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import _ from 'lodash';
import { MapPin } from 'lucide-react-native';
import { RefreshControl } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { fetchUserPosts } from '@/api';
import { formatDistance } from '@/utils/date';
import { Box } from './ui/box';
import { Card } from './ui/card';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Pressable } from './ui/pressable';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

const PostListView = ({ userDocumentId }: any) => {
  const { data, fetchNextPage, hasNextPage, isLoading, isSuccess, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['posts', 'list', { userDocumentId }],
      queryFn: fetchUserPosts,
      initialPageParam: {
        pagination: {
          page: 1,
          pageSize: 20,
        },
        userDocumentId,
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
            userDocumentId,
          };
        }

        return null;
      },
    });

  const posts: any = isSuccess
    ? _.reduce(data?.pages, (result: any, item: any) => [...result, ...item.data], [])
    : [];

  const renderItem = ({ item, index }: any) => {
    return (
      <Box className={`mt-6 rounded-lg ${index === 0 ? 'mt-0' : ''}`}>
        <Pressable onPress={() => router.push(`/posts/${item.documentId}`)}>
          <Card>
            <VStack space="lg">
              <VStack space="sm">
                <Heading numberOfLines={1} ellipsizeMode="tail">
                  {item.title}
                </Heading>
                <HStack className="items-center justify-between">
                  <Text size="xs">{formatDistance(item.createdAt)}</Text>
                  <HStack space="xs" className="items-center">
                    {item.poi?.address && (
                      <>
                        <Icon as={MapPin} size="xs" />
                        <Text size="xs">{item.poi.address}</Text>
                      </>
                    )}
                  </HStack>
                </HStack>
              </VStack>
              <Text numberOfLines={5}>{item.content}</Text>
            </VStack>
          </Card>
        </Pressable>
      </Box>
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
      <FlatList
        data={posts}
        nestedScrollEnabled={true}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.documentId}
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
    </Box>
  );
};

export default PostListView;
