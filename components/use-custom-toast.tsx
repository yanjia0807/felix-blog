import React from 'react';
import _ from 'lodash';
import { Pressable } from 'react-native';
import { Button, ButtonGroup, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';
import { CloseIcon, Icon } from './ui/icon';
import { Toast, ToastDescription, ToastTitle, useToast } from './ui/toast';
import { VStack } from './ui/vstack';

const Alert = ({ id, action, title, description, close }: any) => {
  const nativeID = `toast-${id}`;

  return (
    <Toast nativeID={nativeID} action={action} className="min-w-[240] max-w-[320] shadow-hard-2">
      <VStack space="sm">
        <HStack className="items-center" space="sm">
          <ToastTitle>{title}</ToastTitle>
        </HStack>
        <ToastDescription size="sm">{description}</ToastDescription>
      </VStack>
      <Pressable onPress={close} className="absolute right-2 top-2">
        <Icon as={CloseIcon} />
      </Pressable>
    </Toast>
  );
};

const Confirm = ({ id, onConfirm, title, description, close }: any) => {
  const nativeID = `toast-${id}`;

  return (
    <Toast
      variant="outline"
      nativeID={nativeID}
      className="w-full min-w-[240] max-w-[320] flex-row gap-4 p-4 shadow-hard-2">
      <VStack space="xl" className="flex-1">
        <VStack space="xs">
          <HStack className="items-center justify-between">
            <ToastTitle className="font-semibold">{title}</ToastTitle>
            <Pressable onPress={close}>
              <Icon as={CloseIcon} />
            </Pressable>
          </HStack>
          <ToastDescription>{description}</ToastDescription>
        </VStack>
        <ButtonGroup className="flex-row gap-3">
          <Button
            action="positive"
            size="sm"
            className="flex-grow"
            onPress={() => {
              onConfirm();
            }}>
            <ButtonText>确定</ButtonText>
          </Button>
          <Button action="negative" size="sm" className="flex-grow" onPress={() => close}>
            <ButtonText>取消</ButtonText>
          </Button>
        </ButtonGroup>
      </VStack>
    </Toast>
  );
};

const Custom = ({ id, title, description, actions, close }: any) => {
  const nativeID = `toast-${id}`;

  return (
    <Toast
      action="error"
      nativeID={nativeID}
      className="w-full min-w-[240] max-w-[320] flex-row gap-4 p-4 shadow-hard-2">
      <VStack space="xl" className="flex-1">
        <VStack space="xs">
          <HStack className="items-center justify-between">
            <ToastTitle className="font-semibold text-typography-900">{title}</ToastTitle>
            <Pressable onPress={close}>
              <Icon as={CloseIcon} className="stroke-background-500" />
            </Pressable>
          </HStack>
          <ToastDescription className="text-typography-700">{description}</ToastDescription>
        </VStack>
        <ButtonGroup className="flex-row gap-3">
          {_.map(actions, (action: any, index: number) => (
            <Button key={index} size="sm" className="flex-grow" onPress={() => action['onPress']()}>
              <ButtonText>{action.buttonText}</ButtonText>
            </Button>
          ))}
        </ButtonGroup>
      </VStack>
    </Toast>
  );
};

const useCustomToast = () => {
  const toast = useToast();

  const alert = ({ toastId, action, title, description, ...props }: any) => {
    const id = toastId || _.random(0, 999999999);
    const close = toast.close(id);

    if (!toast.isActive(id)) {
      toast.show({
        id,
        placement: 'top',
        duration: 3000,
        render: ({ id }: any) => (
          <Alert id={id} title={title} description={description} action={action} close={close} />
        ),
        ...props,
      });
    }
  };

  const success = ({ toastId, title = '操作成功', description, ...props }: any) => {
    alert({ toastId, title, description, action: 'success', ...props });
  };

  const info = ({ toastId, title = '操作提示', description, ...props }: any) => {
    alert({ toastId, title, description, action: 'info', ...props });
  };

  const error = ({ toastId, title = '操作失败', description, ...props }: any) => {
    alert({ toastId, title, description, action: 'error', ...props });
  };

  const confirm = ({ toastId, title = '请确认', description, onConfirm, ...props }: any) => {
    const id = toastId || _.random(0, 999999999);
    const close = toast.close(id);

    if (!toast.isActive(id)) {
      toast.show({
        id,
        placement: 'top',
        duration: null,
        render: ({ id }) => (
          <Confirm id={id} title={title} description={description} onConfirm={onConfirm} />
        ),
        close,
        ...props,
      });
    }
  };

  const custom = ({ toastId, title, description, actions, ...props }: any) => {
    const id = toastId || _.random(0, 999999999);
    const close = toast.close(id);

    if (!toast.isActive(id)) {
      toast.show({
        id,
        placement: 'top',
        duration: null,
        close,
        render: ({ id }) => (
          <Custom id={id} title={title} description={description} actions={actions} />
        ),
        ...props,
      });
    }
  };

  return {
    success,
    info,
    error,
    confirm,
    custom,
    close: (toastId: string) => {
      toast.close(toastId);
    },
  };
};

export default useCustomToast;
