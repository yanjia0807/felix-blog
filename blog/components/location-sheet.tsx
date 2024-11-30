import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { init, Geolocation } from 'react-native-amap-geolocation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from './ui/box';
import { Divider } from './ui/divider';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { VStack } from './ui/vstack';

const LocationSheet = forwardRef(function LocationSheet({ setLocation }: any, ref: any) {
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [places, setPlaces] = useState<any>([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const getLocation = async () => {};
  const reverseGeocodeLocation = async () => {};
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const initLocation = async () => {
      await init({
        ios: process.env['EXPO_PUBLIC_AMAP_IOS_KEY'] as string,
        android: '',
      });
    };

    initLocation();

    Geolocation.getCurrentPosition(
      ({ coords }) => {
        setCurrentLocation(coords);
        console.log('@@@@', coords);
      },
      (error) => {
        console.log('@@@@', error);
      },
    );
  }, []);

  return (
    <BottomSheet
      snapPoints={['50%', '80%']}
      index={-1}
      backdropComponent={BottomSheetBackdrop}
      topInset={insets.top}
      bottomInset={insets.bottom}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
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
