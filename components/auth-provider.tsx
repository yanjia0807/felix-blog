import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { DeviceEventEmitter } from 'react-native';
import { fetchMe } from '@/api';
import {
  loginUser,
  registerUser,
  registerOtp,
  verifyOtp,
  sendOtp,
  resetPassword,
  sendEmailConfirmation,
  sendResetPasswordEmail,
  changePassword,
  resetPasswordOtp,
} from '@/api/auth';

const AuthContext = createContext<any>(undefined);

export const AuthProvider = ({ children }: any) => {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<any>();
  const [user, setUser] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data, isError, isSuccess } = useQuery({
    queryKey: ['users', 'detail', 'me'],
    queryFn: fetchMe,
    enabled: !!accessToken,
  });

  const logoutMutation = useCallback(async () => {
    setIsLogin(false);
    setUser(null);
    setAccessToken(null);
    await SecureStore.deleteItemAsync('accessToken');
    queryClient.clear();
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: (data: any) => loginUser(data),
    onSuccess: async (data: any) => {
      await SecureStore.setItemAsync('accessToken', data.jwt);
      setAccessToken(data.jwt);
    },
    onError: (error: Error) => {
      throw error;
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => registerUser(data),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => changePassword(data),
    onSuccess: async (data: any) => {
      await SecureStore.setItemAsync('accessToken', data.jwt);
      setAccessToken(data.jwt);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const forgetPasswordMutation = useMutation({
    mutationFn: (data: any) => sendResetPasswordEmail(data),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: any) => resetPassword(data),
  });

  const sendEmailConfirmationMutation = useMutation({
    mutationFn: (data: any) => sendEmailConfirmation(data),
  });

  const registerOtpMutation = useMutation({
    mutationFn: (data: any) => registerOtp(data),
  });

  const sendOtpMutation = useMutation({
    mutationFn: (data: any) => sendOtp(data),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: any) => verifyOtp(data),
  });

  const resetPasswordOtpMutation = useMutation({
    mutationFn: (data: any) => resetPasswordOtp(data),
  });

  useEffect(() => {
    const loadData = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        console.log('Loaded token:', token);
        setAccessToken(token);
      }
    };

    loadData();

    const subscription = DeviceEventEmitter.addListener('UNAUTHORIZED', async () => {
      console.log('登录状态已失效');
      logoutMutation();
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      setIsLogin(true);
      setUser(data);
    } else if (isError) {
      setIsLogin(false);
      setUser(null);
    }
  }, [data, isError, isSuccess]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLogin,
        loginMutation,
        logoutMutation,
        registerMutation,
        changePasswordMutation,
        forgetPasswordMutation,
        resetPasswordMutation,
        sendEmailConfirmationMutation,
        registerOtpMutation,
        sendOtpMutation,
        verifyOtpMutation,
        resetPasswordOtpMutation,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
