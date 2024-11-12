import React, { forwardRef, useImperativeHandle } from 'react';
import { Toast, ToastDescription, ToastTitle, useToast } from './ui/toast';
import { CircleAlert, CircleCheckBig, HelpCircleIcon, Info } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { Button, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';
import { CloseIcon, Icon } from './ui/icon';
import { VStack } from './ui/vstack';

const AlertToast = ({ id, description, action = 'info' }: any) => {
  const toast = useToast();

  const titles: any = {
    info: '提示!',
    success: '成功!',
    error: '出错了!',
  };

  let IconComponent = null;
  switch (action) {
    case 'info':
      IconComponent = Info;
      break;
    case 'success':
      IconComponent = CircleCheckBig;
      break;
    case 'error':
      IconComponent = CircleAlert;
      break;
    default:
      IconComponent = Info;
      break;
  }

  return (
    <Toast
      action={action}
      nativeID={'toast-' + id}
      className="min-w-[200] max-w-[300] shadow-hard-2">
      <VStack space="sm">
        <HStack className="items-center" space="sm">
          <Icon as={IconComponent} />
          <ToastTitle>{titles[action]}</ToastTitle>
        </HStack>
        <ToastDescription size="sm">{description}</ToastDescription>
      </VStack>
      <Pressable
        onPress={() => {
          console.log(id);
          debugger;
          toast.close(id);
        }}
        className="absolute right-2 top-2">
        <Icon as={CloseIcon} />
      </Pressable>
    </Toast>
  );
};

export default AlertToast;
