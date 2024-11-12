import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import { loginUser, registerUser, sendEmailConfirmation, sendResetPasswordEmail } from '@/api/auth';
import { setClientAuth } from '@/api';
import { fetchMe } from '@/api';

const AuthContext = createContext<any>(undefined);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const loadAuthData = async () => {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        setAccessToken(accessToken);
        setClientAuth(accessToken);
        const user = await fetchMe();
        setUser(user);
      }
    };

    loadAuthData();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('accessToken');
    setUser(null);
    setAccessToken(null);
    setClientAuth(null);
  };

  const loginMutation = useMutation({
    mutationFn: (data: any) => loginUser(data),
    onSuccess: async (data) => {
      await AsyncStorage.setItem('accessToken', data.jwt);
      setUser(data.user);
      setAccessToken(data.jwt);
      setClientAuth(data.jwt);
    },
    onError: (error) => console.error(error),
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => registerUser(data),
    onSuccess: async (data) => {
      await AsyncStorage.setItem('accessToken', data.jwt);
      setUser(data.user);
      setAccessToken(data.jwt);
      setClientAuth(data.jwt);
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
    mutationFn: (data: any) => sendResetPasswordEmail(data),
    onSuccess: async (data) => {},
    onError: (error) => {
      console.error(error);
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
        user,
        accessToken,
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
