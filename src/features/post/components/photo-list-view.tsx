import { useCarousel } from '@/components/carousel-provider';
import { ListEmptyView } from '@/components/list-empty-view';
import { fileFullUrl, imageFormat } from '@/utils/file';
import { MasonryFlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import _ from 'lodash';
import React from 'react';
import { RefreshControl, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';

const AnimatedMasonryFlashList = Animated.createAnimatedComponent(MasonryFlashList);

const PhotoListView: React.FC<any> = ({ query, userDocumentId, headerHeight, scrollHandler }) => {
  const { onOpen } = useCarousel();
  const numColumns = 3;
  const { width: windowWidth } = useWindowDimensions();

  const images: any = _.reduce(
    query.data?.pages,
    (result: any, page: any) => {
      return [
        ...result,
        ..._.filter(
          page.data || [],
          (item: any) => _.startsWith(item.mime, 'image') || _.startsWith(item.mime, 'video'),
        ).map((item: any) => {
          return _.startsWith(item.mime, 'image')
            ? {
                ...item,
                uri: imageFormat(item, 's', 't')?.fullUrl,
                preview: imageFormat(item, 'l')?.fullUrl,
              }
            : {
                id: item.id,
                data: item,
                uri: imageFormat(item.attachmentExtras?.thumbnail, 's', 't')?.fullUrl,
                preview: fileFullUrl(item),
              };
        }),
      ];
    },
    [],
  );

  const onImagePress = (index: number) => onOpen(images, index);

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
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  };

  return (
    <AnimatedMasonryFlashList
      data={images}
      contentContainerStyle={{ paddingTop: headerHeight }}
      getItemType={() => 'image'}
      renderItem={renderItem}
      numColumns={numColumns}
      ItemSeparatorComponent={renderItemSeparator}
      ListEmptyComponent={renderEmptyComponent}
      estimatedItemSize={windowWidth / numColumns}
      onEndReached={onEndReached}
      onScroll={scrollHandler}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={query.isLoading}
          onRefresh={() => {
            if (!query.isLoading) {
              query.refetch();
            }
          }}
        />
      }
    />
  );
};

export default PhotoListView;
