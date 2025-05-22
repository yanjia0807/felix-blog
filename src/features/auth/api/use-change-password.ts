import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { changePassword } from '@/api';

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
