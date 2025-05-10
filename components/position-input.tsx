import React, { forwardRef, useMemo, useState, useCallback, useRef } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useInfiniteQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import _ from 'lodash';
import { MapPinIcon } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import { init, Geolocation, Position, PositionError } from 'react-native-amap-geolocation';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { amapIosApiKey } from '@/api';
import { fetchAround } from '@/api/amap';
import { Text } from '@/components/ui/text';
import { useAuth } from './auth-provider';
import PageSpinner from './page-spinner';
import { Box } from './ui/box';
import { Button, ButtonIcon, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { RefreshControl } from './ui/refresh-control';
import { VStack } from './ui/vstack';
import useToast from '../hooks/use-custom-toast';
import { Card } from './ui/card';

const appName = Constants?.expoConfig?.extra?.name || '';

export const PositionInput = ({ value, onChange }: any) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const toast = useToast();

  const onInputButtonPress = async () => {
    const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

    if (status === RESULTS.GRANTED) {
      bottomSheetRef.current?.present();
    } else if (status === RESULTS.BLOCKED) {
      toast.info({
        description: `请在 [系统设置] 里允许 ${appName} 访问您的位置。`,
      });
    } else {
      const status = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      if (status === RESULTS.GRANTED) {
        bottomSheetRef.current?.present();
      } else {
        toast.info({
          description: `请在 [系统设置] 里允许 ${appName} 访问您的位置。`,
        });
      }
    }
  };

  const onClearButtonPress = () => {
    onChange(undefined);
  };

  return (
    <>
      {value ? (
        <HStack space="lg">
          <Button variant="link" action="secondary" onPress={() => onInputButtonPress()}>
            <ButtonIcon as={MapPinIcon} />
            <ButtonText>{value.name}</ButtonText>
          </Button>
          <Button variant="link" action="secondary" onPress={() => onClearButtonPress()}>
            <ButtonText>[清除]</ButtonText>
          </Button>
        </HStack>
      ) : (
        <Button variant="link" action="secondary" onPress={() => onInputButtonPress()}>
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
  const snapPoints = useMemo(() => ['80%'], []);
  const insets = useSafeAreaInsets();
  const user = useAuth();

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

  const renderEmptyComponent = (props: any) => {
    return (
      <View className="mt-32 w-full flex-1 items-center">
        <Text size="sm">没有数据</Text>
      </View>
    );
  };

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

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      onChange={onSheetChange}>
      <VStack className="flex-1 bg-background-100 p-4" space="md">
        <PageSpinner isVisiable={isLoading} />
        <Heading className="self-center">请选择位置</Heading>
        <BottomSheetFlatList
          data={places}
          renderItem={renderItem}
          ItemSeparatorComponent={renderSeparatorComponent}
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
      </VStack>
    </BottomSheetModal>
  );
});
