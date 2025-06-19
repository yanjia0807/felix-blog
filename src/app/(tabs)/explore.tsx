import { MainHeader } from '@/components/header';
import { ListEmptyView } from '@/components/list-empty-view';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { VStack } from '@/components/ui/vstack';
import { useFetchExplorePosts } from '@/features/post/api/use-fetch-explore-posts';
import { ExploreItem } from '@/features/post/components/explore-item';
import ExploreListSkeleton from '@/features/post/components/explore-list-skeleton';
import {
  usePostExploreActions,
  useSelectedIndex,
} from '@/features/post/store/use-post-explore-store';
import { useFetchTags } from '@/features/tag/api/use-fetch-tags';
import TagItem from '@/features/tag/components/tag-item';
import { toAttachmetItem } from '@/utils/file';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { MasonryFlashList } from '@shopify/flash-list';
import _ from 'lodash';
import React, { memo, useCallback, useState } from 'react';
import { FlatList, RefreshControl, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const segments = [
  {
    key: 'trending',
    name: '热点',
  },
  {
    key: 'following',
    name: '关注',
  },
  {
    key: 'discover',
    name: '发现',
  },
];

const ExploreTagList: React.FC<any> = memo(function ExploreTagList() {
  const tagsQuery = useFetchTags();
  const tags = _.flatMap(tagsQuery.data?.pages, (page) => page.data);

  const onEndReached = () => {
    if (tagsQuery.hasNextPage && !tagsQuery.isFetchingNextPage) {
      tagsQuery.fetchNextPage();
    }
  };

  const renderTagItem = useCallback(
    ({ item, index }: any) => <TagItem item={item} index={index} />,
    [],
  );

  return (
    <Animated.View entering={FadeIn} className="items-center">
      <FlatList
        data={tags}
        renderItem={renderTagItem}
        keyExtractor={(item: any) => item.documentId}
        contentContainerClassName="flex-grow"
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        onEndReached={onEndReached}
      />
    </Animated.View>
  );
});

const ExploreHeader: React.FC<any> = ({ onLayout }) => {
  const segmentNames = _.map(segments, (item: any) => item.name);
  const selectedIndex = useSelectedIndex();
  const { setSelectedIndex } = usePostExploreActions();
  const onSegmentChange = (event) => setSelectedIndex(event.nativeEvent.selectedSegmentIndex);

  return (
    <VStack space="md" className="mb-4" onLayout={onLayout}>
      <MainHeader />
      <SegmentedControl
        values={segmentNames}
        selectedIndex={selectedIndex}
        onChange={onSegmentChange}
      />
      {segments[selectedIndex].key === 'discover' && <ExploreTagList />}
    </VStack>
  );
};

const Explore: React.FC<any> = () => {
  const [headerLayout, setHeaderLayout] = useState(null);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabbarHeight = 92;
  const listHeight = windowHeight - insets.top - headerLayout?.height || 0 - tabbarHeight;

  const postsQuery = useFetchExplorePosts({ segments });

  const onHeaderLayout = (event) => {
    setHeaderLayout(event.nativeEvent.layout);
  };

  const posts: any = _.map(
    _.flatMap(postsQuery.data?.pages, (page: any) => page.data),
    (item: any) => ({
      ...item,
      cover: item.cover ? toAttachmetItem(item.cover, item.attachmentExtras) : undefined,
    }),
  );

  const renderItem = useCallback(
    ({ item, columnIndex }: any) => <ExploreItem item={item} columnIndex={columnIndex} />,
    [],
  );

  const renderListHeader = useCallback(() => <ExploreHeader onLayout={onHeaderLayout} />, []);

  const renderEmptyComponent = () => <ListEmptyView />;

  const onEndReached = () => {
    if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) postsQuery.fetchNextPage();
  };

  if (postsQuery.data) {
    return (
      <SafeAreaView className="flex-1">
        <VStack className="px-4" space="md" style={{ height: listHeight }}>
          <MasonryFlashList
            ListHeaderComponent={renderListHeader}
            renderItem={renderItem}
            ListEmptyComponent={renderEmptyComponent}
            keyExtractor={(item: any) => item.documentId}
            data={posts}
            numColumns={2}
            estimatedItemSize={380}
            showsVerticalScrollIndicator={false}
            onEndReached={onEndReached}
            refreshControl={
              <RefreshControl
                refreshing={postsQuery.isLoading}
                onRefresh={() => {
                  if (postsQuery.hasNextPage && !postsQuery.isLoading) {
                    postsQuery.refetch();
                  }
                }}
              />
            }
          />
        </VStack>
      </SafeAreaView>
    );
  }

  return <ExploreListSkeleton />;
};

const ExploreLayout: React.FC<any> = () => {
  return <Explore />;
};

export default ExploreLayout;
