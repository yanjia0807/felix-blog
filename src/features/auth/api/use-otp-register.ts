import { useMutation } from '@tanstack/react-query';
import { registerByOtp } from '@/api';

export const useOtpRegister = () =>
  useMutation({
    mutationFn: (data: any) => registerByOtp(data),
    onError(error, variables, context) {
      console.error(error);
    },
  });
