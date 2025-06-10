import { resetPasswordByOtp } from '@/api';
import { useMutation } from '@tanstack/react-query';

export const useResetPasswordByOtp = () =>
  useMutation({
    mutationFn: (data: any) => resetPasswordByOtp(data),
    onError(error, variables, context) {
      console.error(error);
    },
  });
