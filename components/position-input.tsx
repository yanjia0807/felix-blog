import React, { forwardRef, useMemo, useEffect, useState, useCallback, useRef } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useInfiniteQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import _ from 'lodash';
import { MapPinIcon } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchAround } from '@/api/amap';
import { Text } from '@/components/ui/text';
import { useAuth } from './auth-context';
import PageSpinner from './page-spinner';
import { Box } from './ui/box';
import { Button, ButtonIcon, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { RefreshControl } from './ui/refresh-control';
import { VStack } from './ui/vstack';
import useCustomToast from './use-custom-toast';

const appName = Constants?.expoConfig?.extra?.name || '';

export const PositionInput = ({ value, onChange }: any) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [permission, requestPermission] = Location.useForegroundPermissions();
  const toast = useCustomToast();

  const onInputButtonPress = async () => {
    if (permission?.granted) {
      bottomSheetRef.current?.present();
    } else {
      const result = await requestPermission();
      if (result.granted) {
        bottomSheetRef.current?.present();
      } else {
        if (!result.canAskAgain) {
          toast.info({
            description: `请在 [系统设置] 里允许 ${appName} 访问您的位置。`,
          });
        }
      }
    }
  };

  const onClearButtonPress = () => onChange(undefined);

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
  const [location, setLocation] = useState<any>(null);
  const snapPoints = useMemo(() => ['80%'], []);
  const insets = useSafeAreaInsets();
  const user = useAuth();

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['user', 'detail', user.documentId, 'location', 'list'],
      queryFn: fetchAround,
      initialPageParam: {
        location: {
          latitude: location?.coords?.latitude,
          longitude: location?.coords?.longitude,
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
      enabled: !!location,
    });

  const places = _.reduce(data?.pages, (result: any, item: any) => [...result, ...item.pois], []);
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

  const onSheetChange = async (index: number) => {
    if (index === 0) {
      const result: any = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      setLocation(result);
    }
  };

  const renderPositionItem = ({ item }: any) => (
    <TouchableOpacity className="p-2" onPress={() => onSelectBtnPressed(item)}>
      <Text size="md" bold={true}>
        {item.name}
      </Text>
      <Text size="sm">{item.address}</Text>
      <Divider></Divider>
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
        <VStack className="mb-4 items-center">
          <Heading className="p-2">请选择位置</Heading>
          <Divider />
        </VStack>
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
      </VStack>
    </BottomSheetModal>
  );
});
