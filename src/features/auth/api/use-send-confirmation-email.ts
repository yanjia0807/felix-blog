import { sendConfirmationEmail } from '@/api';
import { useMutation } from '@tanstack/react-query';

export const useSendConfirmationEmail = () =>
  useMutation({
    mutationFn: (data: any) => sendConfirmationEmail(data),
    onError(error, variables, context) {
      console.error(error);
    },
  });
