import React, { useEffect, useMemo } from 'react';
import { MasonryFlashList } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import _ from 'lodash';
import { RefreshControl, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { fetchUserPhotos } from '@/api';
import { ListEmptyView } from '@/components/list-empty-view';
import { usePagerView } from '@/features/image/components/pager-view-provider';
import { FileTypeNum, isImage, isVideo, imageFormat, fileFullUrl } from '@/utils/file';

const numColumns = 3;

const PhotoListView = ({ userDocumentId }: any) => {
  const { setPages, onOpenPage } = usePagerView();
  const { width } = useWindowDimensions();

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

  const onImagePress = (index: number) => onOpenPage(index);

  const images: any = useMemo(() => {
    if (isSuccess) {
      return _.reduce(
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
                    uri: imageFormat(item, 's', 't')?.fullUrl,
                    preview: imageFormat(item, 'l')?.fullUrl,
                  }
                : {
                    id: item.id,
                    data: item,
                    fileType: FileTypeNum.Video,
                    uri: imageFormat(item.attachmentExtras?.thumbnail, 's', 't')?.fullUrl,
                    preview: fileFullUrl(item),
                  };
            }),
          ];
        },
        [],
      );
    } else {
      return [];
    }
  }, [data?.pages, isSuccess]);

  const renderItem = ({ item, index }: any) => {
    return (
      <TouchableOpacity onPress={() => onImagePress(index)}>
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
      </TouchableOpacity>
    );
  };

  const renderItemSeparator = () => <View style={{ marginBottom: 1 }} />;

  const renderEmptyComponent = () => <ListEmptyView />;

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setPages(images);
    }
  }, [images, isSuccess, setPages]);

  return (
    <View className="mr-1/4 flex-1">
      <MasonryFlashList
        data={images}
        getItemType={() => 'image'}
        renderItem={renderItem}
        numColumns={numColumns}
        ItemSeparatorComponent={renderItemSeparator}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={width / numColumns}
        onEndReached={onEndReached}
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
      />
    </View>
  );
};

export default PhotoListView;
