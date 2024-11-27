import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useEffect, useState } from 'react';

import { BottomSheetBackdrop, BottomSheetDragIndicator } from './ui/bottomsheet';
import { HStack } from './ui/hstack';
import { VStack } from './ui/vstack';

const LocationSheet = forwardRef(function LocationSheet({ setLocation }: any, ref: any) {
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [places, setPlaces] = useState<any>([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const iosKey = process.env.EXPO_PUBLIC_AMAP_IOS_KEY as string;
  const getLocation = async () => {};

  const reverseGeocodeLocation = async () => {};

  useEffect(() => {}, []);

  const handleRegionChange = (region: any) => {};

  return (
    <BottomSheetModal
      snapPoints={['50%']}
      backdropComponent={BottomSheetBackdrop}
      handleComponent={BottomSheetDragIndicator}
      ref={ref}>
      <BottomSheetView className="flex-1">
        <VStack className="flex-1 p-4 items-center" space="2xl">
          <HStack></HStack>
        </VStack>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default LocationSheet;
