import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft } from 'lucide-react-native';
import { View, SafeAreaView, FlatList, RefreshControl } from 'react-native';
import { fetchPosts } from '@/api';
import AlbumPagerView from '@/components/album-pager-view';
import PageSpinner from '@/components/page-spinner';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { PostItem } from '../(tabs)';

const PostTagList = () => {
  const { name, documentId } = useLocalSearchParams();
  const router = useRouter();
  const [isPagerOpen, setIsPagerOpen] = useState(false);
  const [pagerIndex, setPagerIndex] = useState<number>(0);
  const [album, setAblum] = useState<any>([]);
  const onPagerClose = () => setIsPagerOpen(false);
  const filters = {
    tags: {
      documentId,
    },
  };

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

  const posts: any = postQuery.isLoading
    ? Array(2).fill(undefined)
    : postQuery.isSuccess
      ? _.reduce(postQuery.data?.pages, (result: any, item: any) => [...result, ...item.data], [])
      : [];

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

  const renderHeaderLeft = () => (
    <Button action="secondary" variant="link" onPress={() => router.back()}>
      <ButtonIcon as={ChevronLeft} />
      <ButtonText>返回</ButtonText>
    </Button>
  );
  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <SafeAreaView className="flex-1">
        <VStack className="flex-1 p-4">
          <PageSpinner isVisiable={postQuery.isLoading} />
          <Heading>{name}</Heading>
          <FlatList
            data={posts}
            contentContainerClassName="flex-grow"
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
                  postQuery.refetch();
                }}
              />
            }
          />
        </VStack>
      </SafeAreaView>
      <AlbumPagerView
        initIndex={pagerIndex}
        value={album}
        isOpen={isPagerOpen}
        onClose={onPagerClose}
      />
    </>
  );
};

export default PostTagList;
