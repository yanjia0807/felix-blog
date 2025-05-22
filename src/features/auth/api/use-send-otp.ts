import { useMutation } from '@tanstack/react-query';
import { sendOtp } from '@/api';

export const useSendOtp = () =>
  useMutation({
    mutationFn: (data: any) => sendOtp(data),
    onError(error, variables, context) {
      console.error(error);
    },
  });
