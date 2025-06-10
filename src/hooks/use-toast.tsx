import { Alert, Confirm } from '@/components/toast';
import { useToast as useUIToast } from '@/components/ui/toast';
import _ from 'lodash';
import React from 'react';

const useToast = () => {
  const toast = useUIToast();
  const [toastId, setToastId] = React.useState<string>('0');

  const alert = ({ action, title, description, ...props }: any) => {
    const close = (id) => toast.close(id);

    if (!toast.isActive(toastId)) {
      const newId = _.random(0, 999999999).toString();
      setToastId(newId);
      toast.show({
        id: newId,
        placement: 'top',
        duration: 1500,
        render: ({ id }: any) => {
          const uniqueToastId = 'toast-' + id;
          return (
            <Alert
              nativeID={uniqueToastId}
              title={title}
              description={description}
              action={action}
              close={() => close(id)}
            />
          );
        },
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
    const close = (id) => toast.close(id);

    if (!toast.isActive(toastId)) {
      const newId = _.random(0, 999999999).toString();
      setToastId(newId);

      toast.show({
        id: newId,
        placement: 'top',
        duration: null,
        render: ({ id }) => {
          const uniqueToastId = 'toast-' + id;
          return (
            <Confirm
              nativeID={uniqueToastId}
              title={title}
              description={description}
              onConfirm={onConfirm}
              close={() => close(id)}
            />
          );
        },
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
    close: (id) => {
      toast.close(id);
    },
  };
};

export default useToast;
