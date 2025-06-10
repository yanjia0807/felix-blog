import { sendResetPasswordEmail } from '@/api';
import { useMutation } from '@tanstack/react-query';

export const useSendResetPasswordEmail = () =>
  useMutation({
    mutationFn: (data: any) => sendResetPasswordEmail(data),
    onError(error, variables, context) {
      console.error(error);
    },
  });
