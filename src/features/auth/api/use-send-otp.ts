import { sendOtp } from '@/api';
import { useMutation } from '@tanstack/react-query';

export const useSendOtp = () =>
  useMutation({
    mutationFn: (data: any) => sendOtp(data),
    onError(error, variables, context) {
      console.error(error);
    },
  });
