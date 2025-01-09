import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useInfiniteQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { MapPinIcon } from 'lucide-react-native';
import React, { forwardRef, useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { init, Geolocation, Position, PositionError } from 'react-native-amap-geolocation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { amapIosApiKey } from '@/api';
import { fetchAround } from '@/api/amap';
import { Text } from '@/components/ui/text';
import { Box } from './ui/box';
import { Button, ButtonIcon, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Pressable } from './ui/pressable';
import { RefreshControl } from './ui/refresh-control';
import { VStack } from './ui/vstack';

export const PositionInput = ({ value, onChange }: any) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const onInputButtonPressed = () => {
    bottomSheetRef.current?.present();
  };

  const onClearButtonPressed = () => {
    onChange(undefined);
  };

  return (
    <>
      {value ? (
        <HStack space="lg">
          <Button variant="link" action="secondary" onPress={() => onInputButtonPressed()}>
            <ButtonIcon as={MapPinIcon} />
            <ButtonText>{value.name}</ButtonText>
          </Button>
          <Button variant="link" action="secondary" onPress={() => onClearButtonPressed()}>
            <ButtonText>[清除]</ButtonText>
          </Button>
        </HStack>
      ) : (
        <Button variant="link" action="secondary" onPress={() => onInputButtonPressed()}>
          <ButtonIcon as={MapPinIcon} />
          <ButtonText>位置</ButtonText>
        </Button>
      )}

      <PositionSheet onChange={onChange} ref={bottomSheetRef} />
    </>
  );
};

export const PositionSheet = forwardRef(function Sheet({ onChange }: any, ref: any) {
  const [position, setPosition] = useState<Position | null>(null);
  const snapPoints = useMemo(() => ['50%', '90%'], []);
  const insets = useSafeAreaInsets();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    isSuccess,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['position'],
    queryFn: fetchAround,
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

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}>
      <VStack className="flex-1 bg-background-100 p-4" space="md">
        <VStack className="mb-4 items-center">
          <Heading className="p-2">请选择位置</Heading>
          <Divider />
        </VStack>
        {isError && (
          <Box className="flex-1 items-center">
            <Text>{error.message}</Text>
          </Box>
        )}
        {isSuccess && (
          <BottomSheetFlatList
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
        )}
      </VStack>
    </BottomSheetModal>
  );
});
