import { changePassword } from '@/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';

export const useChangePassword = () =>
  useMutation({
    mutationFn: (data: any) => changePassword(data),
    onSuccess: async (data: any) => {
      await AsyncStorage.setItem('accessToken', data.jwt);
    },
    onError: (error) => {
      console.error(error);
    },
  });
