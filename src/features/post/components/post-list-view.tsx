import { ListEmptyView } from '@/components/list-empty-view';
import _ from 'lodash';
import React, { useRef } from 'react';
import { RefreshControl } from 'react-native';
import Animated from 'react-native-reanimated';
import PostSimpleItem from './post-simple-item';

const PostListView: React.FC<any> = ({ userDocumentId, query, headerHeight, scrollHandler }) => {
  const rowRefs = useRef(new Map());

  const posts: any = _.flatMap(query.data?.pages, (page) => page.data);

  const closeSwipeables = () => {
    [...rowRefs.current.entries()].forEach(([key, ref]) => {
      if (ref) ref.close();
    });
  };

  const onEndReached = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  };

  const renderItem = ({ item, index }: any) => (
    <PostSimpleItem
      item={item}
      index={index}
      userDocumentId={userDocumentId}
      rowRefs={rowRefs}
      closeSwipeables={closeSwipeables}
    />
  );

  const renderEmptyComponent = () => <ListEmptyView />;

  return (
    <Animated.FlatList
      contentContainerStyle={{ paddingTop: headerHeight }}
      data={posts}
      contentContainerClassName="flex-s"
      renderItem={renderItem}
      keyExtractor={(item: any) => item.documentId}
      ListEmptyComponent={renderEmptyComponent}
      onEndReached={onEndReached}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={scrollHandler}
      refreshControl={
        <RefreshControl
          refreshing={query.isLoading}
          onRefresh={() => {
            if (!query.isLoading) query.refetch();
          }}
        />
      }
    />
  );
};

export default PostListView;
