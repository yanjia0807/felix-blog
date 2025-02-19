import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { apiServerURL, fetchMe } from '@/api';
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
import { Avatar, AvatarFallbackText, AvatarImage } from './ui/avatar';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Pressable } from './ui/pressable';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

const AuthContext = createContext<any>(undefined);

export const AuthProvider = ({ children }: any) => {
  let [accessToken, setAccessToken] = useState<any>();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: fetchMe,
    enabled: !!accessToken,
    initialData: null,
  });

  useEffect(() => {
    const loadAuthData = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      console.log('Loaded token:', token);
      setAccessToken(token);
    };

    loadAuthData();
  }, []);

  const logoutMutation = async () => {
    await queryClient.setQueryData(['users', 'me'], () => null);
    setAccessToken(null);
    await SecureStore.deleteItemAsync('accessToken');
    await queryClient.removeQueries({
      queryKey: ['users', 'me'],
    });
    queryClient.clear();
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
        user: data,
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

export const AuthHeader = ({ className, title, subtitle }: any) => {
  return (
    <HStack className={twMerge('mb-20 items-center', className)} space="md">
      <Image
        alt="logo"
        source={require('../assets/images/icon.png')}
        style={{ width: 40, height: 40, borderRadius: 6 }}
      />
      <VStack>
        <Heading>{title}</Heading>
        {subtitle && <Text sub={true}>{subtitle}</Text>}
      </VStack>
    </HStack>
  );
};

export const AuthorInfo = ({ author }: any) => {
  const { user } = useAuth();

  const onAvatarPress = (documentId: string) => {
    if (user?.documentId === documentId) {
      router.push('/profile');
    } else {
      router.push(`/users/${documentId}`);
    }
  };

  return (
    <Pressable onPress={() => onAvatarPress(author.documentId)}>
      <HStack className="items-center" space="sm">
        <Avatar size="sm">
          <AvatarFallbackText>{author.username}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: `${apiServerURL}${author.avatar?.formats.thumbnail.url}`,
            }}
          />
        </Avatar>
        <VStack>
          <Text size="sm" bold={true}>
            {author.username}
          </Text>
        </VStack>
      </HStack>
    </Pressable>
  );
};
