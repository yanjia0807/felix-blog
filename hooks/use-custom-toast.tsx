import React from 'react';
import _ from 'lodash';
import { Alert, Confirm } from '@/components/custom-toast';
import { useToast as useUIToast } from '@/components/ui/toast';

const useToast = () => {
  const toast = useUIToast();
  const id = _.random(0, 999999999).toString();

  const alert = ({ action, title, description, ...props }: any) => {
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

  const success = ({ title = '成功', description, ...props }: any) => {
    alert({ title, description, action: 'success', ...props });
  };

  const warning = ({ title = '提醒', description, ...props }: any) => {
    alert({ title, description, action: 'warning', ...props });
  };

  const info = ({ title = '提示', description, ...props }: any) => {
    alert({ title, description, action: 'info', ...props });
  };

  const error = ({ title = '异常', description, ...props }: any) => {
    alert({ title, description, action: 'error', ...props });
  };

  const confirm = ({ title = '确认', description, onConfirm, ...props }: any) => {
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
    warning,
    error,
    confirm,
    close: () => {
      toast.close(id);
    },
  };
};

export default useToast;
