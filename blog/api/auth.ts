import axios from 'axios';
import { apiClient, baseURL } from './config';

export const loginUser = async (credentials: any) => {
  try {
    const res = await apiClient.post(`/auth/local`, {
      identifier: credentials.identifier,
      password: credentials.password,
    });
    return res;
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      throw new Error('无效的登录凭证或密码');
    } else if (error.name === 'ApplicationError') {
      throw new Error('您的账户邮箱尚未验证');
    }
  }
};

export const registerUser = async ({ username, email, password }: any) => {
  try {
    const res = await apiClient.post(`/auth/local/register`, {
      username,
      email,
      password,
    });
    return res;
  } catch (error: any) {
    if (error.name === 'ApplicationError') {
      throw new Error('电子邮件或用户名已被占用');
    }
  }
};

export const sendEmailConfirmation = async ({ email }: any) => {
  const res = await apiClient.post(`/auth/send-email-confirmation`, {
    email,
  });
  return res;
};

export const sendResetPasswordEmail = async ({ email }: any) => {
  const res = await apiClient.post(`/auth/forgot-password`, { email });
  return res;
};

export const resetPassword = async ({ code, password, passwordConfirmation }: any) => {
  const res = await apiClient.post(`/auth/reset-password`, {
    code,
    password,
    passwordConfirmation,
  });
  return res;
};
