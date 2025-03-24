import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

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
import { thumbnailSize } from '@/utils/file';
import { Avatar, AvatarFallbackText, AvatarImage } from './ui/avatar';
import { Button, ButtonText } from './ui/button';

import { VStack } from './ui/vstack';

const AuthContext = createContext<any>(undefined);

export const AuthProvider = ({ children }: any) => {
  const [accessToken, setAccessToken] = useState<any>();
  const [user, setUser] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data, isError, isSuccess } = useQuery({
    queryKey: ['users', 'detail', 'me'],
    queryFn: fetchMe,
    enabled: !!accessToken,
  });

  useEffect(() => {
    if (isSuccess) {
      setUser(data);
    } else if (isError) {
      setUser(null);
    }
  }, [data, isError, isSuccess]);

  const logoutMutation = async () => {
    setAccessToken(null);
    setUser(null);
    queryClient.clear();
    SecureStore.deleteItemAsync('accessToken');
  };

  const loginMutation = useMutation({
    mutationFn: (data: any) => loginUser(data),
    onSuccess: async (data: any) => {
      console.log('login successful, token:', data.jwt);
      await SecureStore.setItemAsync('accessToken', data.jwt);
      setAccessToken(data.jwt);
    },
    onError: (error: Error) => {
      throw error;
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => registerUser(data),
    onSuccess: async (data: any) => {},
    onError: (error) => {
      console.error('error', error);
    },
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
    onSuccess: async (data) => {},
    onError: (error) => {
      console.error(error);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: any) => resetPassword(data),
    onSuccess: async (data) => {},
    onError: (error) => {},
  });

  const sendEmailConfirmationMutation = useMutation({
    mutationFn: (data: any) => sendEmailConfirmation(data),
    onSuccess: async (data) => {},
    onError: (error) => {
      console.error(error);
    },
  });

  const registerOtpMutation = useMutation({
    mutationFn: (data: any) => registerOtp(data),
    onSuccess: async (data: any) => {},
    onError: (error) => {
      console.error('error', error);
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: (data: any) => sendOtp(data),
    onSuccess: async (data: any) => {},
    onError: (error) => {
      console.error('error', error);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: any) => verifyOtp(data),
    onSuccess: async (data: any) => {
      console.log('register successful, token:', data.jwt);
      await SecureStore.setItemAsync('accessToken', data.jwt);
      setAccessToken(data.jwt);
    },
    onError: (error) => {
      console.error('error', error);
    },
  });

  const resetPasswordOtpMutation = useMutation({
    mutationFn: (data: any) => resetPasswordOtp(data),
    onSuccess: async (data) => {},
    onError: (error) => {},
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        logoutMutation,
        loginMutation,
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

export const AuthorInfo = ({ author }: any) => {
  const onAvatarPress = (documentId: string) => {
    router.push(`/users/${documentId}`);
  };

  return (
    <Button variant="link" onPress={() => onAvatarPress(author.documentId)}>
      <Avatar size="sm">
        <AvatarFallbackText>{author.username}</AvatarFallbackText>
        <AvatarImage
          source={{
            uri: thumbnailSize(author.avatar),
          }}
        />
      </Avatar>
      <VStack>
        <ButtonText size="sm">{author.username}</ButtonText>
      </VStack>
    </Button>
  );
};
