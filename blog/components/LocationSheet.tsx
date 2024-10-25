import React, { forwardRef, useEffect, useState } from "react";
import {
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  BottomSheetBackdrop,
  BottomSheetDragIndicator,
} from "./ui/bottomsheet";
import { VStack } from "./ui/vstack";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";
import { init, Geolocation, stop } from "react-native-amap-geolocation";
import { Platform } from "react-native";

const LocationSheet = forwardRef(({ onSuccessed }: any, ref: any) => {
  const [location, setLocation] = useState<any>(null);
  const [places, setPlaces] = useState<any>([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const iosKey = process.env.EXPO_PUBLIC_AMAP_IOS_KEY as string;
  const getLocation = async () => {};

  const reverseGeocodeLocation = async () => {};

  useEffect(() => {
    init({
      ios: iosKey,
      android: "",
    });

    Geolocation.getCurrentPosition(
      (position: any) => {
        console.log(position);
      },
      (error: any) => {
        console.error(error);
      }
    );
  }, []);

  const handleRegionChange = (region: any) => {
    console.log(region);
  };

  return (
    <BottomSheetModal
      snapPoints={["50%"]}
      backdropComponent={BottomSheetBackdrop}
      handleComponent={BottomSheetDragIndicator}
      ref={ref}
    >
      <BottomSheetView className="flex-1">
        <VStack className="flex-1 items-center p-4" space="2xl">
          <HStack>
            <Text>我的位置</Text>
          </HStack>
        </VStack>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default LocationSheet;
