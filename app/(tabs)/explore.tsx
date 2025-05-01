import React, { useState } from 'react';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { MasonryFlashList } from '@shopify/flash-list';
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { FlatList, Pressable, RefreshControl, useWindowDimensions, View } from 'react-native';
import { fetchAllTags, fetchExplorePosts } from '@/api';
import { AnonyBox } from '@/components/anony';
import { useAuth } from '@/components/auth-provider';
import { MainHeader } from '@/components/header';
import { ImageCover, VideoCover } from '@/components/image-input';
import { LikeButton } from '@/components/like-button';
import { usePreferences } from '@/components/preferences-provider';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { UserAvatar } from '@/components/user';
import { fileFullUrl, FileTypeNum, imageFormat, isImage, videoThumbnailUrl } from '@/utils/file';

const ExploreItem: React.FC<any> = ({ item, columnIndex }) => {
  const CONTAINER_PADDING = 14;
  const ITEM_SPACING = 14;
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();
  const { theme } = usePreferences();

  const itemWidth = (screenWidth - CONTAINER_PADDING * 2 - ITEM_SPACING) / 2;
  let itemHeight = (itemWidth / 9) * 16;

  if (isImage(item.cover.mime)) {
    const format = imageFormat(item.cover, 'l', 's');
    const aspectRadio = format.width / format.height;
    itemHeight = Math.min(
      Math.max(itemWidth / aspectRadio, (itemWidth / 3) * 4),
      (itemWidth / 9) * 16,
    );
  }

  return (
    <Pressable onPress={() => router.push(`/posts/${item.documentId}`)} pointerEvents="box-only">
      <VStack
        space="sm"
        style={{
          margin: 7,
          marginLeft: columnIndex === 0 ? 0 : 7,
          marginRight: columnIndex === 1 ? 0 : 7,
        }}>
        <View className="flex-1 items-center justify-end">
          {isImage(item.cover.mime) ? (
            <ImageCover item={item} width={itemWidth} height={itemHeight} />
          ) : (
            <VideoCover item={item} width={itemWidth} height={itemHeight} />
          )}
          <View className="absolute w-full items-center justify-between">
            <BlurView
              intensity={10}
              tint={theme === 'light' ? 'light' : 'dark'}
              style={{ borderRadius: 8 }}>
              <HStack className="w-full items-center justify-end px-2">
                <LikeButton post={item} />
              </HStack>
            </BlurView>
          </View>
        </View>
        <VStack space="sm">
          <Heading numberOfLines={2}>{item.title}</Heading>
          <HStack className="items-center">
            <UserAvatar user={item.author} size="xs" />
          </HStack>
        </VStack>
      </VStack>
    </Pressable>
  );
};

const TagItem: React.FC<any> = ({ item, isLoaded, selectFilterTags, filterTags }) => {
  return (
    <View className={`mx-1 ${isLoaded ? 'h-auto w-auto' : 'h-8 w-16'}`}>
      <Skeleton isLoaded={isLoaded} variant="rounded">
        {item && (
          <Button
            size="sm"
            action="secondary"
            variant={_.includes(filterTags, item.id) ? 'solid' : 'outline'}
            onPress={() => selectFilterTags({ item })}>
            <ButtonText>{item.name}</ButtonText>
          </Button>
        )}
      </Skeleton>
    </View>
  );
};

const ExploreHeader: React.FC<any> = ({
  segments,
  selectedIndex,
  setSelectedIndex,
  filterTags,
  selectFilterTags,
}) => {
  const segmentNames = _.map(segments, (item: any) => item.name);

  const tagsQuery = useQuery({
    queryKey: ['tags', 'list'],
    queryFn: fetchAllTags,
  });

  const tags: any = tagsQuery.isSuccess ? tagsQuery.data : [];

  const renderTagItem = ({ item }: any) => (
    <TagItem
      item={item}
      isLoaded={!tagsQuery.isLoading}
      filterTags={filterTags}
      selectFilterTags={selectFilterTags}
    />
  );

  return (
    <VStack space="xl" className="mb-4">
      <MainHeader />
      <SegmentedControl
        values={segmentNames}
        selectedIndex={selectedIndex}
        onChange={(event) => setSelectedIndex(event.nativeEvent.selectedSegmentIndex)}
      />
      {segments[selectedIndex].key === 'discover' && (
        <HStack className="items-center justify-between" space="md">
          <FlatList
            data={tags}
            renderItem={renderTagItem}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        </HStack>
      )}
    </VStack>
  );
};

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

const ExplorePage: React.FC<any> = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filterTags, setFilterTags] = useState<any>([]);
  const { isLogin, user } = useAuth();
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

  const isShow = isLogin || (!isLogin && segments[selectedIndex].key !== 'following');

  const postsQuery = useInfiniteQuery({
    queryKey: ['posts', 'list', { filterType, filters }],
    queryFn: fetchExplorePosts,
    placeholderData: keepPreviousData,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 10,
      },
      filterType,
      filters,
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
          filterType,
          filters,
        };
      }

      return null;
    },
  });

  const posts: any = postsQuery.isSuccess
    ? _.reduce(
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
      )
    : [];

  const selectFilterTags = ({ item }: any) => {
    if (_.includes(filterTags, item.id)) {
      setFilterTags((val: any) => _.filter(filterTags, (val: any) => val !== item.id));
    } else {
      setFilterTags((val: any) => [...filterTags, item.id]);
    }
  };

  const renderListItem = (props: any) => <ExploreItem {...props} />;

  const onEndReached = () => {
    if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) postsQuery.fetchNextPage();
  };

  return (
    <SafeAreaView className="flex-1">
      <VStack className="flex-1 px-4">
        <ExploreHeader
          filterTags={filterTags}
          selectFilterTags={selectFilterTags}
          segments={segments}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
        />
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
          <AnonyBox />
        )}
      </VStack>
    </SafeAreaView>
  );
};

export default ExplorePage;
