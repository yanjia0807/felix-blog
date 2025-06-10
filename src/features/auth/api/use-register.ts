import { register } from '@/api';
import { useMutation } from '@tanstack/react-query';

export const useRegister = () =>
  useMutation({
    mutationFn: (data: any) => register(data),
    onError(error, variables, context) {
      console.error(error);
    },
  });
