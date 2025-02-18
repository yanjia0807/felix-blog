import { MasonryFlashList } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import _ from 'lodash';
import React, { useState } from 'react';
import { RefreshControl, useWindowDimensions } from 'react-native';
import GalleryPreview from 'react-native-gallery-preview';
import { apiServerURL, fetchUserPhotos } from '@/api';
import { Box } from './ui/box';
import { Pressable } from './ui/pressable';
import { Text } from './ui/text';

const numColumns = 3;

const PhotoListView = ({ userDocumentId }: any) => {
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [isGalleryPreviewOpen, setIsGalleryPreviewOpen] = useState(false);
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
      queryKey: ['posts', 'list', { userDocumentId }, 'photos'],
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

  const onOpenGallery = async (index: number) => {
    setImageIndex(index);
    setIsGalleryPreviewOpen(true);
  };

  const photos: any = isSuccess
    ? _.reduce(
        data?.pages,
        (result: any, page: any) => {
          return [
            ...result,
            ...page.data.map((item: any) => ({
              ...item,
              uri: `${apiServerURL}${item.formats?.thumbnail.url}` || `${apiServerURL}${item.url}`,
            })),
          ];
        },
        [],
      )
    : [];

  const originPhotos: any = isSuccess
    ? _.reduce(
        data?.pages,
        (result: any, page: any) => {
          return [
            ...result,
            ...page.data.map((item: any) => ({
              ...item,
              uri: `${apiServerURL}${item.url}`,
            })),
          ];
        },
        [],
      )
    : [];

  const renderItem = ({ item, index }: any) => {
    return (
      <Pressable onPress={() => onOpenGallery(index)}>
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
        data={photos}
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
      <GalleryPreview
        images={originPhotos || []}
        initialIndex={imageIndex}
        isVisible={isGalleryPreviewOpen}
        onRequestClose={() => setIsGalleryPreviewOpen(false)}
      />
    </Box>
  );
};

export default PhotoListView;
