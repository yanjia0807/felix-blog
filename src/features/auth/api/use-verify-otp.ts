import { verifyOtp } from '@/api';
import { useMutation } from '@tanstack/react-query';

export const useVerifyOtp = () =>
  useMutation({
    mutationFn: (data: any) => verifyOtp(data),
    onError(error, variables, context) {
      console.error(error);
    },
  });
