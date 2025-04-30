import React from 'react';
import _ from 'lodash';
import { CustomAlert, CustomConfirm } from '@/components/custom-toast';
import { useToast } from '@/components/ui/toast';

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
          <CustomAlert
            id={id}
            title={title}
            description={description}
            action={action}
            close={close}
          />
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
          <CustomConfirm
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
