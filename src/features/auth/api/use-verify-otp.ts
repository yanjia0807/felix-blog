import { useMutation } from '@tanstack/react-query';
import { verifyOtp } from '@/api';

export const useVerifyOtp = () =>
  useMutation({
    mutationFn: (data: any) => verifyOtp(data),
    onError(error, variables, context) {
      console.error(error);
    },
  });
