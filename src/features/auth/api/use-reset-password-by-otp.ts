import { useMutation } from '@tanstack/react-query';
import { resetPasswordByOtp } from '@/api';

export const useResetPasswordByOtp = () =>
  useMutation({
    mutationFn: (data: any) => resetPasswordByOtp(data),
    onError(error, variables, context) {
      console.error(error);
    },
  });
