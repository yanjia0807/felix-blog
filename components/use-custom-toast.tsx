import _ from 'lodash';
import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import { Button, ButtonGroup, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';
import { CloseIcon, Icon } from './ui/icon';
import { Toast, ToastDescription, ToastTitle, useToast } from './ui/toast';
import { VStack } from './ui/vstack';

const useCustomToast = () => {
  const toast = useToast();

  const AlertToast = React.useMemo(
    () =>
      function AlertToast({ id, action, title, description }: any) {
        return (
          <Toast nativeID={id} action={action} className="min-w-[240] max-w-[320] shadow-hard-2">
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
      },
    [toast],
  );

  const ConfirmToast = React.useMemo(
    () =>
      function ConfirmToast({ id, onConfirm, title, description }: any) {
        return (
          <Toast
            variant="outline"
            nativeID={id}
            className="w-full min-w-[240] max-w-[320] flex-row gap-4 p-4 shadow-hard-2">
            <VStack space="xl" className="flex-1">
              <VStack space="xs">
                <HStack className="items-center justify-between">
                  <ToastTitle className="font-semibold">{title}</ToastTitle>
                  <Pressable onPress={() => toast.close(id)}>
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
                <Button
                  action="negative"
                  size="sm"
                  className="flex-grow"
                  onPress={() => toast.close(id)}>
                  <ButtonText>取消</ButtonText>
                </Button>
              </ButtonGroup>
            </VStack>
          </Toast>
        );
      },
    [toast],
  );

  const CustomToast = React.useMemo(
    () =>
      function CustomToast({ id, title, description, actions }: any) {
        return (
          <Toast
            action="error"
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
                  <Button
                    key={index}
                    size="sm"
                    className="flex-grow"
                    onPress={() => action['onPress']()}>
                    <ButtonText>{action.buttonText}</ButtonText>
                  </Button>
                ))}
              </ButtonGroup>
            </VStack>
          </Toast>
        );
      },
    [toast],
  );

  const showAlertToast = useCallback(
    ({ toastId, action, title, description, ...props }: any) => {
      toast.show({
        id: toastId,
        placement: 'top',
        duration: 3000,
        render: ({ id }: any) => (
          <AlertToast id={id} title={title} description={description} action={action} />
        ),
        ...props,
      });
    },
    [AlertToast, toast],
  );

  const success = useCallback(
    ({ toastId, title = '操作成功', description, ...props }: any) => {
      showAlertToast({ toastId, title, description, action: 'success', ...props });
    },
    [showAlertToast],
  );

  const info = useCallback(
    ({ toastId, title = '操作提示', description, ...props }: any) => {
      showAlertToast({ toastId, title, description, action: 'info', ...props });
    },
    [showAlertToast],
  );

  const error = useCallback(
    ({ toastId, title = '操作失败', description, ...props }: any) => {
      showAlertToast({ toastId, title, description, action: 'error', ...props });
    },
    [showAlertToast],
  );

  const confirm = useCallback(
    ({ toastId, title = '请确认', description, onConfirm, ...props }: any) => {
      toast.show({
        id: toastId,
        placement: 'top',
        duration: null,
        render: ({ id }) => (
          <ConfirmToast id={id} title={title} description={description} onConfirm={onConfirm} />
        ),
        ...props,
      });
    },
    [ConfirmToast, toast],
  );

  const custom = useCallback(
    ({ toastId, title, description, actions, ...props }: any) => {
      toast.show({
        id: toastId,
        placement: 'top',
        duration: null,
        render: ({ id }) => (
          <CustomToast id={id} title={title} description={description} actions={actions} />
        ),
        ...props,
      });
    },
    [CustomToast, toast],
  );

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
