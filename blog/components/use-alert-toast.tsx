import React, { memo } from 'react';
import { Toast, ToastDescription, ToastTitle, useToast } from './ui/toast';
import { Pressable } from 'react-native';
import { HStack } from './ui/hstack';
import { CloseIcon, Icon } from './ui/icon';
import { VStack } from './ui/vstack';
import _ from 'lodash';

const AlertToast = memo(function AlertToast({ toast, id, action, title, description }: any) {
  const nativeID = id || _.random().toString();

  return (
    <Toast action={action} nativeID={nativeID} className="min-w-[200] max-w-[300] shadow-hard-2">
      <VStack space="sm">
        <HStack className="items-center" space="sm">
          <ToastTitle>{title}</ToastTitle>
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

  const success = ({ title = '操作成功', description }: any) => {
    toast.show({
      placement: 'top',
      render: ({ id }: any) => (
        <AlertToast
          toast={toast}
          id={id}
          title={title}
          description={description}
          action="success"
        />
      ),
      ...props,
    });
  };

  const info = ({ title = '操作提示', description }: any) => {
    toast.show({
      placement: 'top',
      render: ({ id }: any) => (
        <AlertToast id={id} title={title} description={description} action="info" />
      ),
      ...props,
    });
  };

  const error = ({ title = '操作失败', description }: any) => {
    toast.show({
      placement: 'top',
      render: ({ id }: any) => (
        <AlertToast id={id} title={title} description={description} action="error" />
      ),
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
