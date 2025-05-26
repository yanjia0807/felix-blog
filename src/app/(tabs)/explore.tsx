import React, { useCallback, useState } from 'react';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { MasonryFlashList } from '@shopify/flash-list';
import _ from 'lodash';
import { FlatList, RefreshControl, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { PageFallbackUI } from '@/components/fallback';
import { MainHeader } from '@/components/header';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { AnonyView } from '@/features/auth/components/anony';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useFetchExplorePosts } from '@/features/post/api/use-fetch-explore-posts';
import { ExploreItem } from '@/features/post/components/explore-item';
import ExploreListSkeleton from '@/features/post/components/explore-list-skeleton';
import { useFetchTags } from '@/features/tag/api/use-fetch-tags';
import TagItem from '@/features/tag/components/tag-item';
import TagListSkeleton from '@/features/tag/components/tag-list-skeleton';
import { fileFullUrl, FileTypeNum, imageFormat, isImage, videoThumbnailUrl } from '@/utils/file';

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

const ExploreHeader: React.FC<any> = ({
  selectedIndex,
  setSelectedIndex,
  filterTags,
  selectFilterTags,
}) => {
  const segmentNames = _.map(segments, (item: any) => item.name);

  const tagsQuery = useFetchTags();

  const tags = _.flatMap(tagsQuery.data?.pages, (page) => page.data);

  const renderTagItem = useCallback(
    ({ item, index }: any) => (
      <TagItem
        item={item}
        index={index}
        filterTags={filterTags}
        selectFilterTags={selectFilterTags}
      />
    ),
    [filterTags, selectFilterTags],
  );

  const onEndReached = () => {
    if (tagsQuery.hasNextPage && !tagsQuery.isFetchingNextPage) {
      tagsQuery.fetchNextPage();
    }
  };

  return (
    <VStack space="xl" className="mb-4">
      <MainHeader />
      <SegmentedControl
        values={segmentNames}
        selectedIndex={selectedIndex}
        onChange={(event) => setSelectedIndex(event.nativeEvent.selectedSegmentIndex)}
      />
      {segments[selectedIndex].key === 'discover' && (
        <Animated.View entering={FadeIn} className="items-center justify-between">
          {tagsQuery.isLoading ? (
            <TagListSkeleton />
          ) : (
            <FlatList
              data={tags}
              renderItem={renderTagItem}
              keyExtractor={(item: any) => item.documentId}
              contentContainerClassName="flex-grow"
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              onEndReached={onEndReached}
            />
          )}
        </Animated.View>
      )}
    </VStack>
  );
};

const ExplorePage: React.FC<any> = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filterTags, setFilterTags] = useState<any>([]);
  const { user } = useAuth();
  const filterType = segments[selectedIndex].key;
  let filters: any;
  switch (filterType) {
    case 'discover':
      filters = { tags: filterTags };
      break;
    case 'following':
      filters = { followings: _.map(user?.followings || [], (item: any) => item.documentId) };
      break;
    default:
      filters = undefined;
      break;
  }

  const isShow = !_.isNil(user) || (_.isNil(user) && segments[selectedIndex].key !== 'following');

  const postsQuery = useFetchExplorePosts({ filterType, filters });

  const posts: any = _.reduce(
    postsQuery.data?.pages,
    (result: any, page: any) => [
      ...result,
      ...page.data.map((item: any) => {
        const cover = !item.cover
          ? undefined
          : isImage(item.cover.mime)
            ? {
                ...item.cover,
                fileType: FileTypeNum.Image,
                uri: fileFullUrl(item.cover),
                thumbnail: imageFormat(item.cover, 's', 's')?.fullUrl,
                preview: imageFormat(item.cover, 'l')?.fullUrl,
              }
            : {
                ...item.cover,
                fileType: FileTypeNum.Video,
                uri: fileFullUrl(item.cover),
                thumbnail: videoThumbnailUrl(item.cover, item.attachmentExtras),
                preview: fileFullUrl(item.cover),
              };

        return {
          ...item,
          cover,
        };
      }),
    ],
    [],
  );

  const selectFilterTags = ({ item }: any) => {
    if (_.includes(filterTags, item.id)) {
      setFilterTags((val: any) => _.filter(filterTags, (val: any) => val !== item.id));
    } else {
      setFilterTags((val: any) => [...filterTags, item.id]);
    }
  };

  const renderListItem = useCallback(
    ({ item, columnIndex }: any) => <ExploreItem item={item} columnIndex={columnIndex} />,
    [],
  );

  const onEndReached = () => {
    if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) postsQuery.fetchNextPage();
  };

  return (
    <SafeAreaView className="flex-1">
      <VStack className="flex-1 px-4">
        <ExploreHeader
          filterTags={filterTags}
          selectFilterTags={selectFilterTags}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
        />
        {postsQuery.isSuccess && (
          <>
            {isShow ? (
              <MasonryFlashList
                renderItem={renderListItem}
                ListEmptyComponent={
                  <View className="mt-32 flex-1 items-center justify-center">
                    <Text size="sm">暂无数据</Text>
                  </View>
                }
                keyExtractor={(item: any) => item.documentId}
                data={posts}
                numColumns={2}
                estimatedItemSize={260}
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
            ) : (
              <AnonyView className="mt-32 self-center" />
            )}
          </>
        )}
        {postsQuery.isLoading && <ExploreListSkeleton />}
      </VStack>
    </SafeAreaView>
  );
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default ExplorePage;
