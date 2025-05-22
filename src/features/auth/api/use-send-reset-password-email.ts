import { useMutation } from '@tanstack/react-query';
import { sendResetPasswordEmail } from '@/api';

export const useSendResetPasswordEmail = () =>
  useMutation({
    mutationFn: (data: any) => sendResetPasswordEmail(data),
    onError(error, variables, context) {
      console.error(error);
    },
  });
