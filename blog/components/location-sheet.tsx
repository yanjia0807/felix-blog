import BottomSheet, { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useEffect, useState } from 'react';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetBackdrop, BottomSheetDragIndicator } from './ui/bottomsheet';
import { Box } from './ui/box';
import { Divider } from './ui/divider';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { VStack } from './ui/vstack';

const LocationSheet = forwardRef(function LocationSheet({ setLocation }: any, ref: any) {
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [places, setPlaces] = useState<any>([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const iosKey = process.env.EXPO_PUBLIC_AMAP_IOS_KEY as string;
  const getLocation = async () => {};
  const reverseGeocodeLocation = async () => {};
  const insets = useSafeAreaInsets();

  useEffect(() => {}, []);

  const handleRegionChange = (region: any) => {};

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

  return (
    <BottomSheet
      snapPoints={['50%', '80%']}
      index={-1}
      backdropComponent={renderBackdrop}
      topInset={insets.top}
      bottomInset={insets.bottom}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      handleComponent={BottomSheetDragIndicator}
      ref={ref}>
      <BottomSheetView className="flex-1 m-4">
        <VStack className="flex-1 p-4 items-center" space="2xl">
          <HStack></HStack>
        </VStack>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default LocationSheet;
