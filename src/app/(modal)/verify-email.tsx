import SendOtpForm from '@/features/auth/components/send-otp-form';
import React from 'react';

const VerifyEmailPage: React.FC = () => {
  return <SendOtpForm title="验证邮箱" purpose="verify-email" />;
};

export default VerifyEmailPage;
