import { publicClient, client } from './config';

export const loginUser = async (credentials: any) => {
  const response = await publicClient.post(`/auth/local`, {
    identifier: credentials.identifier,
    password: credentials.password,
  });
  return response.data;
};

export const registerUser = async ({ username, email, password }: any) => {
  const response = await publicClient.post(`/auth/local/register`, {
    username,
    email,
    password,
  });
  return response.data;
};

export const sendEmailConfirmation = async ({ email }: any) => {
  const response = await publicClient.post(`/auth/send-email-confirmation`, {
    email,
  });
  return response.data;
};

export const sendResetPasswordEmail = async ({ email }: any) => {
  const response = await publicClient.post(`/auth/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async ({ code, password, passwordConfirmation }: any) => {
  const response = await publicClient.post(`/auth/reset-password`, {
    code,
    password,
    passwordConfirmation,
  });
  return response.data;
};
