import { useMutation } from '@tanstack/react-query';
import { sendConfirmationEmail } from '@/api';

export const useSendConfirmationEmail = () =>
  useMutation({
    mutationFn: (data: any) => sendConfirmationEmail(data),
    onError(error, variables, context) {
      console.error(error);
    },
  });
