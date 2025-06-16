import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { MapPin } from 'lucide-react-native';
import React, { useRef } from 'react';
import { Keyboard } from 'react-native';
import { DistrictSheet } from './district-sheet';

export const DistrictPicker = ({ value, onChange, placeholder }: any) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const onInputPressed = () => {
    Keyboard.dismiss();
    bottomSheetRef.current?.present();
  };

  const displayValue = value
    ? `${value.provinceName || ''} ${value.cityName || ''} ${value.districtName || ''}`
    : '';

  return (
    <>
      <Input variant="rounded" isReadOnly={true}>
        <InputField
          placeholder={placeholder}
          value={displayValue}
          onPress={() => onInputPressed()}
        />
        <InputSlot className="mr-2">
          <InputIcon as={MapPin}></InputIcon>
        </InputSlot>
      </Input>
      <DistrictSheet ref={bottomSheetRef} onChange={(val: any) => onChange(val)} value={value} />
    </>
  );
};
