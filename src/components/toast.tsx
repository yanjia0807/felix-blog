import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { CloseIcon, Icon } from '@/components/ui/icon';
import { Toast, ToastDescription, ToastTitle } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import React from 'react';
import { TouchableOpacity } from 'react-native';

export const Alert = ({ id, action, title, description, close }: any) => {
  const nativeID = `toast-${id}`;

  return (
    <Toast nativeID={nativeID} action={action} className="min-w-[240] max-w-[320] shadow-hard-2">
      <VStack space="sm">
        <HStack className="items-center" space="sm">
          <ToastTitle>{title}</ToastTitle>
        </HStack>
        <ToastDescription size="sm">{description}</ToastDescription>
      </VStack>
      <TouchableOpacity onPress={close} className="absolute right-2 top-2">
        <Icon as={CloseIcon} />
      </TouchableOpacity>
    </Toast>
  );
};

export const Confirm = ({ nativeID, onConfirm, title, description, close }: any) => {
  return (
    <Toast
      variant="outline"
      nativeID={nativeID}
      className="w-full min-w-[240] max-w-[320] flex-row gap-4 p-4 shadow-hard-2">
      <VStack space="xl" className="flex-1">
        <VStack space="xs">
          <HStack className="items-center justify-between">
            <ToastTitle className="font-semibold">{title}</ToastTitle>
            <TouchableOpacity onPress={close}>
              <Icon as={CloseIcon} />
            </TouchableOpacity>
          </HStack>
          <ToastDescription>{description}</ToastDescription>
        </VStack>
        <ButtonGroup className="flex-row gap-3">
          <Button
            action="positive"
            size="sm"
            className="flex-grow"
            onPress={async () => {
              await onConfirm();
              close();
            }}>
            <ButtonText>确定</ButtonText>
          </Button>
          <Button action="negative" size="sm" className="flex-grow" onPress={close}>
            <ButtonText>取消</ButtonText>
          </Button>
        </ButtonGroup>
      </VStack>
    </Toast>
  );
};
