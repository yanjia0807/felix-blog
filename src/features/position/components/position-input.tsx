import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import useToast from '@/hooks/use-toast';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import Constants from 'expo-constants';
import { MapPinIcon } from 'lucide-react-native';
import React, { useRef } from 'react';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { PositionSheet } from './position-sheet';

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
