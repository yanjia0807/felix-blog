import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { MapPinIcon } from 'lucide-react-native';
import React, { useRef } from 'react';
import { PositionSheet } from './position-sheet';

export const PositionPicker = ({ value, onChange }: any) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const onInputButtonPress = async () => {
    bottomSheetRef.current?.present();
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
          <Button variant="link" action="negative" onPress={() => onClearButtonPress()}>
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
