import { MasonryFlashList } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import _ from 'lodash';
import React, { useMemo, useState } from 'react';
import { RefreshControl, useWindowDimensions } from 'react-native';
import GalleryPreview from 'react-native-gallery-preview';
import { apiServerURL, fetchUserPhotos } from '@/api';
import { useAuth } from './auth-context';
import { Box } from './ui/box';
import { Pressable } from './ui/pressable';
import { Text } from './ui/text';

const numColumns = 3;

const PhotoListView = () => {
  const { user } = useAuth();
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

  const { data, error, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['posts', { user: user.documentId }],
      queryFn: fetchUserPhotos,
      initialPageParam: {
        pagination: {
          page: 1,
          pageSize: 5,
        },
        userDocumentId: user.documentId,
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
            userDocumentId: user.documentId,
          };
        }

        return null;
      },
    });

  const onOpenGallery = async (index: number) => {
    setImageIndex(index);
    setIsGalleryPreviewOpen(true);
  };

  const listData = useMemo(() => {
    let files = [];

    if (data) {
      files = _.reduce(
        data.pages,
        (result: any, page: any) => {
          const pageFiles = _.reduce(
            page.data,
            (pageResult: any, item: any) => {
              let temp: any = [];
              if (item.cover) {
                temp = [
                  ...temp,
                  {
                    ...item.cover,
                    uri: `${apiServerURL}${item.cover.formats.small.url}`,
                    type: 'cover',
                  },
                ];
              }
              const attachment = _.find(
                item.blocks,
                (block: any) => block['__component'] === 'shared.attachment',
              );
              if (attachment?.files.length > 0) {
                temp = [
                  ...temp,
                  ..._.filter(attachment.files, (file: any) => file.mime.startsWith('image/')).map(
                    (item: any) => ({
                      ...item,
                      uri: `${apiServerURL}${item.formats.small.url}`,
                    }),
                  ),
                ];
              }
              return [...pageResult, ...temp];
            },
            [],
          );
          return [...result, ...pageFiles];
        },
        [],
      );
    }
    return files;
  }, [data]);

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
        data={listData}
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
        images={listData || []}
        initialIndex={imageIndex}
        isVisible={isGalleryPreviewOpen}
        onRequestClose={() => setIsGalleryPreviewOpen(false)}
      />
    </Box>
  );
};

export default PhotoListView;
