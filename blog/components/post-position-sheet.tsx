import { useInfiniteQuery } from '@tanstack/react-query';
import _ from 'lodash';
import React, { forwardRef, useMemo, useEffect, useState, memo } from 'react';
import { init, Geolocation, Position, PositionError } from 'react-native-amap-geolocation';
import { amapIosApiKey } from '@/api';
import { fetchPositionRound } from '@/api/amap';
import { Text } from '@/components/ui/text';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetFlatList,
} from './ui/actionsheet';
import { Box } from './ui/box';
import { Divider } from './ui/divider';
import { Pressable } from './ui/pressable';
import { RefreshControl } from './ui/refresh-control';
import { VStack } from './ui/vstack';

const PostPositionSheet = forwardRef(function PostPositionSheet(
  { onChange, isOpen, onClose }: any,
  ref: any,
) {
  const [position, setPosition] = useState<Position | null>(null);

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
    onClose();
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

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose} snapPoints={[50]}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="h-full">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <VStack className="flex-1 justify-between">
          <VStack className="flex-1" space="md">
            {error && (
              <Box className="flex-1 items-center justify-center">
                <Text>{error.message}</Text>
              </Box>
            )}
            {isSuccess && (
              <Box className="flex-1">
                <ActionsheetFlatList
                  data={places}
                  keyExtractor={(item: any) => item.id}
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
        </VStack>
      </ActionsheetContent>
    </Actionsheet>
  );
});

export default memo(PostPositionSheet);
