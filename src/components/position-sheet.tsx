import { ListEmptyView } from '@/components/list-empty-view';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import usePosition from '@/hooks/use-position';
import { useFetchPostionAround } from '@/hooks/use-position-around';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import _ from 'lodash';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PageSpinner from './page-spinner';

export const PositionSheet = forwardRef(function Sheet({ onChange }: any, ref: any) {
  const snapPoints = useMemo(() => ['80%'], []);
  const insets = useSafeAreaInsets();
  const { position, getCurrentPosition } = usePosition();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useFetchPostionAround(position);

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

  const onSnapChange = (index: number) => {
    if (index >= 0) {
      getCurrentPosition();
    }
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
      onChange={onSnapChange}>
      <VStack className="flex-1 bg-background-100 p-2" space="md">
        <Heading className="self-center">请选择位置</Heading>
        {data ? (
          <BottomSheetFlatList
            data={places}
            renderItem={renderItem}
            ItemSeparatorComponent={renderSeparatorComponent}
            ListEmptyComponent={renderEmptyComponent}
            showsVerticalScrollIndicator={false}
            onEndReached={onEndReached}
          />
        ) : (
          <PageSpinner />
        )}
      </VStack>
    </BottomSheetModal>
  );
});
