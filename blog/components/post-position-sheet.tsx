import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlashList,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useInfiniteQuery } from '@tanstack/react-query';
import _ from 'lodash';
import React, { forwardRef, useMemo, useEffect, useState, useCallback, memo } from 'react';
import { RefreshControl } from 'react-native';
import { init, Geolocation, Position, PositionError } from 'react-native-amap-geolocation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { amapIosApiKey } from '@/api';
import { fetchPositionRound } from '@/api/amap';
import { Text } from '@/components/ui/text';
import { Box } from './ui/box';
import { Divider } from './ui/divider';
import { Pressable } from './ui/pressable';
import { VStack } from './ui/vstack';

const PostPositionSheet = forwardRef(function PostPositionSheet({ onChange }: any, ref: any) {
  const insets = useSafeAreaInsets();
  const [position, setPosition] = useState<Position | null>(null);
  const snapPoints = useMemo(() => ['50%', '75%'], []);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    isSuccess,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['position'],
    queryFn: fetchPositionRound,
    initialPageParam: {
      location: `${position?.coords.latitude},${position?.coords.longitude}`,
      page_num: 1,
      page_size: 20,
    },
    getNextPageParam: (lastPage: any, pages: any, lastPageParam: any) => {
      if (Number(lastPage.count) < lastPageParam['page_size'] || Number(lastPage.count) === 0) {
        return undefined;
      }
      return {
        location: lastPageParam.location,
        page_num: lastPageParam['page_num'] + 1,
        page_size: lastPageParam['page_size'],
      };
    },
    enabled: !!position,
  });

  useEffect(() => {
    const initLocation = async () => {
      await init({
        ios: amapIosApiKey as string,
        android: '',
      });

      Geolocation.getCurrentPosition(
        (position: Position) => {
          setPosition(position);
        },
        (error: PositionError) => {
          console.error(error);
        },
      );
    };

    initLocation();
  }, []);

  const places = useMemo(() => {
    if (data)
      return _.reduce(data?.pages, (result: any, item: any) => [...result, ...item.pois], []);
  }, [data]);

  const renderEmptyComponent = (props: any) => {
    return (
      <Box className="mt-10 w-full items-center justify-center">
        <Text size="sm">没有数据</Text>
      </Box>
    );
  };

  const onSelectBtnPressed = (item: any) => {
    onChange(item);
    ref.current?.close();
  };

  const renderPositionItem = ({ item }: any) => (
    <Pressable className="p-2" onPress={() => onSelectBtnPressed(item)}>
      <Text size="md" bold={true}>
        {item.name}
      </Text>
      <Text size="sm">{item.address}</Text>
      <Divider></Divider>
    </Pressable>
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
        pressBehavior="none"
      />
    ),
    [],
  );

  console.log('post-position-sheet render', data);
  return (
    <BottomSheet
      index={-1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      topInset={insets.top}
      bottomInset={insets.bottom}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      ref={ref}>
      <BottomSheetView className="flex-1 p-4 bg-background-100">
        <VStack className="flex-1" space="md">
          {error && (
            <Box className="flex-1 justify-center items-center">
              <Text>{error.message}</Text>
            </Box>
          )}
          {isSuccess && (
            <Box className="flex-1">
              <BottomSheetFlashList
                data={places}
                keyExtractor={(item: any) => item.id}
                estimatedItemSize={70}
                renderItem={renderPositionItem}
                ListEmptyComponent={renderEmptyComponent}
                showsVerticalScrollIndicator={false}
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
              />
            </Box>
          )}
        </VStack>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default memo(PostPositionSheet);
