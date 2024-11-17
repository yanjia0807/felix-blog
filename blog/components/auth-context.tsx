import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  loginUser,
  registerUser,
  resetPassword,
  sendEmailConfirmation,
  sendResetPasswordEmail,
} from '@/api/auth';
import { setAuthHeader, useFetchUser } from '@/api';
import useCustomToast from './use-custom-toast';

const AuthContext = createContext<any>(undefined);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [tokenExists, setTokenExists] = useState<boolean>(false);
  const toast = useCustomToast();
  const { data: userData, error, isFetching, status } = useFetchUser(tokenExists);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadAuthData = async () => {
      const accessToken = await AsyncStorage.getItem('accessToken');
      setTokenExists(!!accessToken);
      console.log('accessToken', accessToken);
      if (accessToken) {
        setAuthHeader(accessToken);
      }
    };

    loadAuthData();
  }, []);

  const logout = async () => {
    console.log('logout');
    await AsyncStorage.removeItem('accessToken');
    queryClient.removeQueries({ queryKey: ['user'] });
    setAuthHeader(null);
  };

  const loginMutation = useMutation({
    mutationFn: (data: any) => loginUser(data),
    onSuccess: async (data: any) => {
      await AsyncStorage.setItem('accessToken', data.jwt);
      setAuthHeader(data.jwt);
      setTokenExists(true);
    },
    onError: (error: Error) => {
      throw error;
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => registerUser(data),
    onSuccess: async (data: any) => {
      console.log('data', data);
    },
    onError: (error) => {
      console.error('error', error);
    },
  });

  const forgetPasswordMutation = useMutation({
    mutationFn: (data: any) => sendResetPasswordEmail(data),
    onSuccess: async (data) => {},
    onError: (error) => {
      console.error(error);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: any) => resetPassword(data),
    onSuccess: async (data) => {
      console.log('resetPasswordMutation', data);
    },
    onError: (error) => {
      console.error('resetPasswordMutation', error);
    },
  });

  const sendEmailConfirmationMutation = useMutation({
    mutationFn: (data: any) => sendEmailConfirmation(data),
    onSuccess: async (data) => {},
    onError: (error) => {
      console.error(error);
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: userData,
        loginMutation,
        registerMutation,
        forgetPasswordMutation,
        resetPasswordMutation,
        sendEmailConfirmationMutation,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
