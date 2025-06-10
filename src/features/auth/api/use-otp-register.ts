import { registerByOtp } from '@/api';
import { useMutation } from '@tanstack/react-query';

export const useOtpRegister = () =>
  useMutation({
    mutationFn: (data: any) => registerByOtp(data),
    onError(error, variables, context) {
      console.error(error);
    },
  });
