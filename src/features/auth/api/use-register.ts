import { useMutation } from '@tanstack/react-query';
import { register } from '@/api';

export const useRegister = () =>
  useMutation({
    mutationFn: (data: any) => register(data),
    onError(error, variables, context) {
      console.error(error);
    },
  });
