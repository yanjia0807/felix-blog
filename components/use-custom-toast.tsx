import React from 'react';
import _ from 'lodash';
import { TouchableOpacity } from 'react-native';
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
      <TouchableOpacity onPress={close} className="absolute right-2 top-2">
        <Icon as={CloseIcon} />
      </TouchableOpacity>
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
            onPress={() => {
              onConfirm();
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

const useCustomToast = () => {
  const toast = useToast();
  const id = _.random(0, 999999999).toString();

  const alert = ({ toastId, action, title, description, ...props }: any) => {
    const close = () => toast.close(id);

    if (!toast.isActive(id)) {
      toast.show({
        id,
        placement: 'top',
        duration: 1500,
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
    const close = () => toast.close(id);

    if (!toast.isActive(id)) {
      toast.show({
        id,
        placement: 'top',
        duration: null,
        render: ({ id }) => (
          <Confirm
            id={id}
            title={title}
            description={description}
            onConfirm={onConfirm}
            close={close}
          />
        ),
        close,
        ...props,
      });
    }
  };

  return {
    success,
    info,
    error,
    confirm,
    close: () => {
      toast.close(id);
    },
  };
};

export default useCustomToast;
