import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { MasonryFlashList } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { Pressable, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { fetchClzPosts } from '@/api';
import { MainHeader } from '@/components/header';
import { LikeButton } from '@/components/like-button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useLayout } from '@/components/use-layout';
import { UserAvatar, UserAvatars } from '@/components/user';
import { fileFullUrl, FileTypeNum, imageFormat, isImage, videoThumbnailUrl } from '@/utils/file';

const CONTAINER_PADDING = 14;
const ITEM_SPACING = 14;

const ExploreMasonryList: React.FC<any> = ({ data, segments, selectedIndex, setSelectedIndex }) => {
  const [{ height, measured }, onLayout] = useLayout();

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
      data={data}
      numColumns={2}
      removeClippedSubviews={true}
      renderItem={renderListItem}
      estimatedItemSize={260}
      showsVerticalScrollIndicator={false}
    />
  );
};

const ExploreItem: React.FC<any> = ({ item, columnIndex }) => {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push(`/posts/${item.documentId}`)}>
      <VStack
        space="sm"
        style={{
          margin: 7,
          marginLeft: columnIndex === 0 ? 0 : 7,
          marginRight: columnIndex === 1 ? 0 : 7,
        }}>
        <View className="flex-1 items-center justify-end">
          {isImage(item.cover.mime) ? <ImageCover item={item} /> : <VideoCover item={item} />}
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

const ImageCover: React.FC<any> = ({ item }) => {
  const { width: screenWidth } = useWindowDimensions();
  const format = imageFormat(item.cover, 'l', 's');
  const aspectRadio = format.width / format.height;
  const width = (screenWidth - CONTAINER_PADDING * 2 - ITEM_SPACING) / 2;
  const height = Math.min(Math.max(width / aspectRadio, (width / 3) * 4), (width / 9) * 16);

  return (
    <Image
      source={{
        uri: item.cover.thumbnail,
      }}
      contentFit="cover"
      style={{
        width,
        height,
        borderRadius: 6,
      }}
    />
  );
};

const VideoCover: React.FC<any> = ({ item }) => {
  const { width: screenWidth } = useWindowDimensions();
  const width = (screenWidth - CONTAINER_PADDING * 2 - ITEM_SPACING) / 2;
  const height = (width / 9) * 16;

  return (
    <View className="flex-1 items-center justify-center">
      <Image
        source={{
          uri: item.cover.thumbnail,
        }}
        contentFit="cover"
        style={{
          width,
          height,
          borderRadius: 6,
        }}
      />
      <View className="absolute">
        <Ionicons name="play-circle-outline" size={42} className="opacity-50" color="white" />
      </View>
    </View>
  );
};

const ExploreHeader: React.FC<any> = ({ segments, selectedIndex, setSelectedIndex }) => {
  const segmentNames = _.map(segments, (item: any) => item.name);
  return (
    <VStack space="xl" className="mb-4">
      <MainHeader />
      <SegmentedControl
        values={segmentNames}
        selectedIndex={selectedIndex}
        onChange={(event) => setSelectedIndex(event.nativeEvent.selectedSegmentIndex)}
      />
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

  const postsQuery = useInfiniteQuery({
    queryKey: ['posts', 'list', 'trending'],
    queryFn: fetchClzPosts,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 25,
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

  return (
    <SafeAreaView className="flex-1">
      <VStack className="flex-1 px-4">
        <ExploreMasonryList
          data={posts}
          segments={segments}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
        />
      </VStack>
    </SafeAreaView>
  );
};

export default ExplorePage;
