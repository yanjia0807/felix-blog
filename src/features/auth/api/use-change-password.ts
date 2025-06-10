import { changePassword } from '@/api';
import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

export const useChangePassword = () =>
  useMutation({
    mutationFn: (data: any) => changePassword(data),
    onSuccess: async (data: any) => {
      await SecureStore.setItemAsync('accessToken', data.jwt);
    },
    onError: (error) => {
      console.error(error);
    },
  });
