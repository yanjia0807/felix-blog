import React, { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { MasonryFlashList } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEvent, useEventListener } from 'expo';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
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

interface ExploreMasonryListProps {
  data: any[];
  currentPlayingId: string | null;
  setCurrentPlayingId: React.Dispatch<React.SetStateAction<string | null>>;
}

const ExploreMasonryList: React.FC<ExploreMasonryListProps> = ({
  data,
  currentPlayingId,
  setCurrentPlayingId,
}) => {
  const [{ height, measured }, onLayout] = useLayout();
  const currentPlayingIdRef = useRef(currentPlayingId);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 500,
    waitForInteraction: false,
  };

  const onViewableItemsChanged = ({ changed }: any) => {
    _.forEach(changed, (changedItem: any) => {
      if (!changedItem.isViewable && changedItem.item.id === currentPlayingIdRef.current) {
        setCurrentPlayingId(null);
      }
    });
  };

  const renderEmptyComponent = (props: any) => {
    if (!measured) return null;
    return (
      <View className="flex-1 items-center justify-center" style={{ height }}>
        <Text size="sm">暂无消息</Text>
      </View>
    );
  };

  const renderListItem = (props: any) => (
    <ExploreItem
      {...props}
      currentPlayingId={currentPlayingId}
      setCurrentPlayingId={setCurrentPlayingId}
    />
  );

  useEffect(() => {
    currentPlayingIdRef.current = currentPlayingId;
  }, [currentPlayingId]);

  return (
    <MasonryFlashList
      keyExtractor={(item) => item.id}
      ListEmptyComponent={renderEmptyComponent}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChanged}
      onLayout={(e) => {
        if (!measured) onLayout(e);
      }}
      extraData={currentPlayingId}
      data={data}
      numColumns={2}
      removeClippedSubviews={true}
      renderItem={renderListItem}
      estimatedItemSize={260}
      showsVerticalScrollIndicator={false}
    />
  );
};

const ExploreItem: React.FC<any> = ({
  item,
  columnIndex,
  currentPlayingId,
  setCurrentPlayingId,
}) => {
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
          {isImage(item.cover.mime) ? (
            <ImageItem data={item.cover} />
          ) : (
            <VideoItem
              id={item.id}
              data={item.cover}
              currentPlayingId={currentPlayingId}
              setCurrentPlayingId={setCurrentPlayingId}
            />
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

const ImageItem: React.FC<any> = ({ data }) => {
  const { width: screenWidth } = useWindowDimensions();
  const format = imageFormat(data, 'l', 's');
  const actualRatio = format.height / format.width;
  const imageWidth = (screenWidth - CONTAINER_PADDING * 2 - ITEM_SPACING) / 2;
  const imageHeight = Math.min(Math.max(imageWidth * actualRatio, 220), 280);
  const uri = format.fullUrl;

  return (
    <Image
      source={{
        uri,
      }}
      contentFit="cover"
      style={{
        width: imageWidth,
        height: imageHeight,
        borderRadius: 6,
      }}
    />
  );
};

const VideoItem: React.FC<any> = ({ id, data, currentPlayingId, setCurrentPlayingId }) => {
  const [isPlayToEnd, setIsPlayToEnd] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = (screenWidth - CONTAINER_PADDING * 2 - ITEM_SPACING) / 2;
  const itemHeight = (itemWidth / 9) * 16;
  const player = useVideoPlayer(data.uri, (player) => {
    player.muted = true;
    player.loop = false;
    player.bufferOptions = {
      minBufferForPlayback: 0,
      preferredForwardBufferDuration: 5,
      maxBufferBytes: 0,
      prioritizeTimeOverSizeThreshold: false,
      waitsToMinimizeStalling: true,
    };
  });

  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  useEventListener(player, 'playToEnd', () => {
    setIsPlayToEnd(true);
    setCurrentPlayingId(null);
  });

  const togglePlay = () => {
    if (isPlaying && !isPlayToEnd) {
      player.pause();
      setCurrentPlayingId(null);
    } else {
      if (isPlayToEnd) {
        setIsPlayToEnd(false);
        player.replay();
      }
      player.play();
      setCurrentPlayingId(id);
    }
  };

  useEffect(() => {
    if (currentPlayingId !== id) {
      player.pause();
    }
  }, [currentPlayingId, id, player]);

  return (
    <View className="flex-1 items-center justify-center">
      <VideoView
        contentFit="cover"
        nativeControls={false}
        player={player}
        style={{ width: itemWidth, height: itemHeight, borderRadius: 6 }}
      />
      <TouchableOpacity onPress={togglePlay} className="absolute">
        <Ionicons
          name={isPlaying ? 'pause-circle-outline' : 'play-circle-outline'}
          size={42}
          className="opacity-70"
          color="white"
        />
      </TouchableOpacity>
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
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
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

  useEffect(() => {
    return () => setCurrentPlayingId(null);
  }, [selectedIndex]);

  return (
    <SafeAreaView className="flex-1">
      <VStack className="flex-1 px-4">
        <ExploreHeader
          segments={segments}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
        />
        <ExploreMasonryList
          data={posts}
          currentPlayingId={currentPlayingId}
          setCurrentPlayingId={setCurrentPlayingId}
        />
      </VStack>
    </SafeAreaView>
  );
};

export default ExplorePage;
