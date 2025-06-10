import SendOtpForm from '@/features/auth/components/send-otp-form';
import React from 'react';

const VerifyEmailPage: React.FC = () => {
  return <SendOtpForm title="重置密码" purpose="reset-password" />;
};

export default VerifyEmailPage;
