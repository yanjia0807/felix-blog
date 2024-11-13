import React, { memo } from 'react';
import { Toast, ToastDescription, ToastTitle, useToast } from './ui/toast';
import { CircleAlert, CircleCheckBig, Info } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { HStack } from './ui/hstack';
import { CloseIcon, Icon } from './ui/icon';
import { VStack } from './ui/vstack';
import _ from 'lodash';

const AlertToast = memo(function AlertToast({ toast, id, action, description }: any) {
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

  const titles: any = {
    info: '提示!',
    success: '成功!',
    error: '出错了!',
  };

  const nativeID = id || _.random().toString();

  return (
    <Toast action={action} nativeID={nativeID} className="min-w-[200] max-w-[300] shadow-hard-2">
      <VStack space="sm">
        <HStack className="items-center" space="sm">
          <Icon as={IconComponent} />
          <ToastTitle>{titles[action]}</ToastTitle>
        </HStack>
        <ToastDescription size="sm">{description}</ToastDescription>
      </VStack>
      <Pressable
        onPress={() => {
          toast.close(id);
        }}
        className="absolute right-2 top-2">
        <Icon as={CloseIcon} />
      </Pressable>
    </Toast>
  );
});

const useAlertToast = (props?: any) => {
  const toast = useToast();

  const success = (description: string) => {
    toast.show({
      placement: 'top',
      render: ({ id }: any) => (
        <AlertToast toast={toast} id={id} description={description} action="success" />
      ),
      ...props,
    });
  };

  const info = (description: string) => {
    toast.show({
      placement: 'top',
      render: ({ id }: any) => <AlertToast id={id} description={description} action="info" />,
      ...props,
    });
  };

  const error = (description: string) => {
    toast.show({
      placement: 'top',
      render: ({ id }: any) => <AlertToast id={id} description={description} action="error" />,
      ...props,
    });
  };

  return {
    success,
    info,
    error,
  };
};

export default useAlertToast;
