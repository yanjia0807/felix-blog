import _ from 'lodash';
import React from 'react';
import { Pressable } from 'react-native';
import { Button, ButtonGroup, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';
import { CloseIcon, Icon } from './ui/icon';
import { Toast, ToastDescription, ToastTitle, useToast } from './ui/toast';
import { VStack } from './ui/vstack';

const CustomToast = ({ toast, id, title, description, actions }: any) => {
  return (
    <Toast
      nativeID={id}
      className="w-full min-w-[240] max-w-[320] flex-row gap-4 p-4 shadow-hard-2">
      <VStack space="xl" className="flex-1">
        <VStack space="xs">
          <HStack className="items-center justify-between">
            <ToastTitle className="font-semibold text-typography-900">{title}</ToastTitle>
            <Pressable onPress={() => toast.close(id)}>
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

const ConfirmToast = ({ toast, id, onConfirm, title, description }: any) => {
  return (
    <Toast
      nativeID={id}
      className="w-full min-w-[240] max-w-[320] flex-row gap-4 p-4 shadow-hard-2">
      <VStack space="xl" className="flex-1">
        <VStack space="xs">
          <HStack className="items-center justify-between">
            <ToastTitle className="font-semibold text-typography-900">{title}</ToastTitle>
            <Pressable onPress={() => toast.close(id)}>
              <Icon as={CloseIcon} className="stroke-background-500" />
            </Pressable>
          </HStack>
          <ToastDescription className="text-typography-700">{description}</ToastDescription>
        </VStack>
        <ButtonGroup className="flex-row gap-3">
          <Button
            size="sm"
            className="flex-grow"
            onPress={() => {
              onConfirm();
            }}>
            <ButtonText>确定</ButtonText>
          </Button>
          <Button
            action="secondary"
            variant="outline"
            size="sm"
            className="flex-grow"
            onPress={() => toast.close(id)}>
            <ButtonText>取消</ButtonText>
          </Button>
        </ButtonGroup>
      </VStack>
    </Toast>
  );
};

const AlertToast = function AlertToast({ toast, id, action, title, description }: any) {
  const nativeID = id || _.random().toString();

  return (
    <Toast action={action} nativeID={nativeID} className="min-w-[240] max-w-[320] shadow-hard-2">
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
};

const useCustomToast = () => {
  const toast = useToast();

  const showAlertToast = ({ toastId, action, title, description, ...props }: any) => {
    const id = toastId || _.random(0, 10000).toString();
    if (!toast.isActive(id)) {
      toast.show({
        id: id,
        placement: 'top',
        render: ({ id }: any) => (
          <AlertToast
            id={id}
            toast={toast}
            title={title}
            description={description}
            action={action}
          />
        ),
        ...props,
      });
    }
  };

  const success = ({ toastId, title = '成功', description, ...props }: any) => {
    showAlertToast({ toastId, title, description, action: 'success', ...props });
  };

  const info = ({ toastId, title = '提示', description, ...props }: any) => {
    showAlertToast({ toastId, title, description, action: 'info', ...props });
  };

  const error = ({ toastId, title = '失败', description, ...props }: any) => {
    showAlertToast({ toastId, title, description, action: 'error', ...props });
  };

  const confirm = ({ toastId, title = '确认', description, onConfirm, props }: any) => {
    const id = toastId || _.random(0, 10000).toString();
    if (!toast.isActive(id)) {
      toast.show({
        id: id,
        placement: 'top',
        duration: null,
        render: ({ id }) => (
          <ConfirmToast
            toast={toast}
            id={id}
            title={title}
            description={description}
            onConfirm={onConfirm}
          />
        ),
        ...props,
      });
    }
  };

  const custom = ({ toastId, title, description, actions, props }: any) => {
    const id = toastId || _.random(0, 10000).toString();
    if (!toast.isActive(id)) {
      toast.show({
        id: id,
        placement: 'top',
        duration: null,
        render: ({ id }) => (
          <CustomToast
            toast={toast}
            id={id}
            title={title}
            description={description}
            actions={actions}
          />
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
