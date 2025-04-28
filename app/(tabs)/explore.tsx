import React, { useCallback, useState } from 'react';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { MasonryFlashList } from '@shopify/flash-list';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { FlatList, Pressable, useWindowDimensions, View } from 'react-native';
import { fetchAllTags, fetchClzPosts } from '@/api';
import { MainHeader } from '@/components/header';
import { ImageCover, VideoCover } from '@/components/image-input';
import { LikeButton } from '@/components/like-button';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useLayout } from '@/components/use-layout';
import { UserAvatar, UserAvatars } from '@/components/user';
import { fileFullUrl, FileTypeNum, imageFormat, isImage, videoThumbnailUrl } from '@/utils/file';

const ExploreMasonryList: React.FC<any> = ({ segments, selectedIndex, setSelectedIndex }) => {
  const [filterTags, setFilterTags] = useState<any>([]);

  const [{ height, measured }, onLayout] = useLayout();
  const clzKey = segments[selectedIndex].key;
  const postsQuery = useInfiniteQuery({
    queryKey: ['posts', 'list', 'clz', { clzKey }],
    queryFn: fetchClzPosts,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 25,
      },
      clzKey,
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
          clzKey,
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

  const selectFilterTags = useCallback(
    ({ item }: any) => {
      if (_.includes(filterTags, item.id)) {
        setFilterTags((val: any) => _.filter(filterTags, (val: any) => val !== item.id));
      } else {
        setFilterTags((val: any) => [...filterTags, item.id]);
      }
    },
    [filterTags],
  );

  const renderEmptyComponent = (props: any) => {
    if (!measured) return null;
    return (
      <View className="flex-1 items-center justify-center" style={{ height }}>
        <Text size="sm">暂无消息</Text>
      </View>
    );
  };

  const renderListItem = (props: any) => <ExploreItem {...props} />;

  const renderHeaderComponent = (props: any) => (
    <ExploreHeader
      {...props}
      filterTags={filterTags}
      selectFilterTags={selectFilterTags}
      segments={segments}
      selectedIndex={selectedIndex}
      setSelectedIndex={setSelectedIndex}
    />
  );

  return (
    <MasonryFlashList
      ListHeaderComponent={renderHeaderComponent}
      ListEmptyComponent={renderEmptyComponent}
      onLayout={(e) => {
        if (!measured) onLayout(e);
      }}
      data={posts}
      numColumns={2}
      removeClippedSubviews={true}
      renderItem={renderListItem}
      estimatedItemSize={260}
      showsVerticalScrollIndicator={false}
    />
  );
};

const ExploreItem: React.FC<any> = ({ item, columnIndex }) => {
  const CONTAINER_PADDING = 14;
  const ITEM_SPACING = 14;
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();

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
          <HStack className="absolute z-20 w-full items-center justify-between px-2">
            <LikeButton post={item} />
            <UserAvatars users={item.likedByUsers} />
          </HStack>
        </View>
        <VStack space="sm">
          <Heading size="sm" numberOfLines={2}>
            {item.title}
          </Heading>
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

  const tags: any = tagsQuery.isLoading
    ? Array(2).fill(undefined)
    : tagsQuery.isSuccess
      ? tagsQuery.data
      : [];

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

const ExplorePage: React.FC<any> = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  return (
    <SafeAreaView className="flex-1">
      <VStack className="flex-1 px-4">
        <ExploreMasonryList
          segments={segments}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
        />
      </VStack>
    </SafeAreaView>
  );
};

export default ExplorePage;
