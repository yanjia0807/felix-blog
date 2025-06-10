import { apiClient } from '../utils/api-client';

export const login = async ({ identifier, password }: any) => {
  try {
    const res = await apiClient.post(`/auth/local`, {
      identifier,
      password,
    });
    return res;
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      throw new Error('无效的登录凭证或密码');
    } else if (error.name === 'ApplicationError') {
      throw new Error('您的账户邮箱尚未验证');
    }

    throw new Error('发生了错误');
  }
};

export const register = async ({ username, email, password }: any) => {
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

    throw new Error('发生了错误');
  }
};

export const sendConfirmationEmail = async ({ email }: any) => {
  const res = await apiClient.post(`/auth/send-email-confirmation`, {
    email,
  });
  return res;
};

export const sendResetPasswordEmail = async ({ email }: any) => {
  const res = await apiClient.post(`/auth/forgot-password`, { email });
  return res;
};

export const changePassword = async ({ currentPassword, password, passwordConfirmation }: any) => {
  try {
    const res = await apiClient.post(`/auth/change-password`, {
      currentPassword,
      password,
      passwordConfirmation,
    });
    return res;
  } catch (error: any) {
    if (error?.message === 'The provided current password is invalid') {
      throw new Error('当前密码错误');
    }

    if (error?.message === 'Your new password must be different than your current password') {
      throw new Error('新密码不能和当前密码相同');
    }

    if (error?.message === 'Passwords do not match') {
      throw new Error('两次密码输入不一致');
    }

    throw new Error('发生了错误');
  }
};

export const registerByOtp = async ({ username, email, password }: any) => {
  try {
    const res = await apiClient.post(`/auth/local/register-otp`, {
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

export const sendOtp = async ({ email, purpose }: any) => {
  try {
    const res = await apiClient.post(`/auth/local/send-otp`, {
      email,
      purpose,
    });
    return res;
  } catch (error: any) {
    if (error?.message === 'User not found') {
      throw new Error('未查询到用户');
    }

    if (error?.message === 'Email has already been confirmed') {
      throw new Error('邮箱已经通过了验证，不需要重新验证');
    }

    throw new Error('发生了错误');
  }
};

export const verifyOtp = async ({ email, code, purpose }: any) => {
  try {
    const res = await apiClient.post(`/auth/local/verify-otp`, {
      email,
      code,
      purpose,
    });
    return res;
  } catch (error: any) {
    if (error?.message === 'User not found') {
      throw new Error('未查询到用户');
    }

    if (error?.message === 'Email has already been confirmed') {
      throw new Error('邮箱已经通过了验证，不需要重新验证');
    }

    if (error?.message === 'Code verification failed') {
      throw new Error('验证码过期或错误');
    }

    throw new Error('发生了错误');
  }
};

export const resetPasswordByOtp = async ({ email, code, password, passwordConfirmation }: any) => {
  try {
    const res = await apiClient.post(`/auth/local/reset-password-otp`, {
      email,
      code,
      password,
      passwordConfirmation,
    });
    return res;
  } catch (error: any) {
    if (error?.message === 'User not found') {
      throw new Error('未查询到用户');
    }

    if (error?.message === 'Your new password must be different than your current password') {
      throw new Error('新密码不能和当前密码相同');
    }

    if (error?.message === 'Passwords do not match') {
      throw new Error('两次密码输入不一致');
    }

    if (error?.message === 'Code verification failed') {
      throw new Error('验证码过期或错误');
    }

    throw new Error('发生了错误');
  }
};
