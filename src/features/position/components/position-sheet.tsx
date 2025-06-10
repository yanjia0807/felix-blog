import { amapIosApiKey } from '@/api';
import { fetchAround } from '@/api/amap';
import { ListEmptyView } from '@/components/list-empty-view';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { RefreshControl } from '@/components/ui/refresh-control';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useInfiniteQuery } from '@tanstack/react-query';
import _ from 'lodash';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Geolocation, init, Position, PositionError } from 'react-native-amap-geolocation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const PositionSheet = forwardRef(function Sheet({ onChange }: any, ref: any) {
  const [position, setPosition] = useState<Position | null>(null);
  const snapPoints = useMemo(() => ['80%'], []);
  const insets = useSafeAreaInsets();

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: [
        'location',
        'list',
        {
          location: {
            latitude: position?.coords?.latitude,
            longitude: position?.coords?.longitude,
          },
        },
      ],
      queryFn: fetchAround,
      initialPageParam: {
        location: {
          latitude: position?.coords?.latitude,
          longitude: position?.coords?.longitude,
        },
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

  const onSheetChange = async (index: number) => {
    const initPosition = async () => {
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
    if (index === 0) {
      initPosition();
    }
  };

  const places = _.reduce(data?.pages, (result: any, item: any) => [...result, ...item.pois], []);

  const renderSeparatorComponent = () => <Divider />;

  const renderEmptyComponent = () => <ListEmptyView />;

  const onSelect = (item: any) => {
    const { location, parent, ...rest } = item;
    const [longitude, latitude] = location.split(',');
    const data = {
      longitude,
      latitude,
      ...rest,
    };
    onChange(data);
    ref.current?.close();
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity onPress={() => onSelect(item)}>
      <Card size="sm" variant="ghost">
        <Text size="md" bold={true}>
          {item.name}
        </Text>
        <Text size="sm">{item.address}</Text>
      </Card>
    </TouchableOpacity>
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={'close'}
      />
    ),
    [],
  );

  const renderFooter = (props: any) => {
    return <BottomSheetFooter {...props} bottomInset={insets.bottom}></BottomSheetFooter>;
  };

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      onChange={onSheetChange}>
      <VStack className="flex-1 bg-background-100 p-2" space="md">
        <Heading className="self-center">请选择位置</Heading>
        <BottomSheetFlatList
          data={places}
          renderItem={renderItem}
          ItemSeparatorComponent={renderSeparatorComponent}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
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
      </VStack>
    </BottomSheetModal>
  );
});
