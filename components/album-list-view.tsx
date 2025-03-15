import React, { useState } from 'react';
import { MasonryFlashList } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import _ from 'lodash';
import { RefreshControl, useWindowDimensions } from 'react-native';
import { fetchUserPhotos } from '@/api';
import { FileTypeNum, isImage, isVideo, largeSize, originSize, thumbnailSize } from '@/utils/file';
import AlbumPagerView from './album-pager-view';
import { Box } from './ui/box';
import { Pressable } from './ui/pressable';
import { Text } from './ui/text';

const numColumns = 3;

const AlbumListView = ({ userDocumentId }: any) => {
  const [pagerIndex, setPagerIndex] = useState<number>(0);
  const [isPagerOpen, setIsPagerOpen] = useState(false);
  const onPagerClose = () => setIsPagerOpen(false);

  const { width } = useWindowDimensions();

  const renderEmptyComponent = (props: any) => {
    return (
      <Box className="mt-10 w-full items-center justify-center">
        <Text size="sm">没有数据</Text>
      </Box>
    );
  };

  const { data, fetchNextPage, hasNextPage, isLoading, isSuccess, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['posts', 'list', { userDocumentId }, 'album'],
      queryFn: fetchUserPhotos,
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

  const onImagePress = (index: number) => {
    setPagerIndex(index);
    setIsPagerOpen(true);
  };

  const images: any = isSuccess
    ? _.reduce(
        data?.pages,
        (result: any, page: any) => {
          return [
            ...result,
            ..._.filter(
              page.data || [],
              (item: any) => isImage(item.mime) || isVideo(item.mime),
            ).map((item: any) => {
              return isImage(item.mime)
                ? {
                    ...item,
                    fileType: FileTypeNum.Image,
                    uri: thumbnailSize(item),
                    preview: largeSize(item),
                  }
                : {
                    id: item.id,
                    data: item,
                    fileType: FileTypeNum.Video,
                    uri: thumbnailSize(item.attachmentExtras?.thumbnail),
                    preview: originSize(item),
                  };
            }),
          ];
        },
        [],
      )
    : [];

  const renderItem = ({ item, index }: any) => {
    return (
      <Pressable onPress={() => onImagePress(index)}>
        <Image
          recyclingKey={item.assetId}
          source={{ uri: item.uri }}
          contentFit="cover"
          style={{
            flex: 1,
            aspectRatio: 1,
            marginLeft: 1,
          }}
          alt={item.alternativeText}
        />
      </Pressable>
    );
  };

  return (
    <Box className="mr-1/4 flex-1">
      <MasonryFlashList
        data={images}
        getItemType={() => 'image'}
        renderItem={renderItem}
        numColumns={numColumns}
        ItemSeparatorComponent={() => <Box style={{ marginBottom: 1 }} />}
        ListEmptyComponent={renderEmptyComponent}
        estimatedItemSize={width / numColumns}
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
        showsVerticalScrollIndicator={false}
        getColumnFlex={(items, index, maxColumns, extraData) => {
          return numColumns;
        }}
      />
      <AlbumPagerView
        initIndex={pagerIndex}
        value={images}
        isOpen={isPagerOpen}
        onClose={onPagerClose}
      />
    </Box>
  );
};

export default AlbumListView;
