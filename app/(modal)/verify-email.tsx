import React from 'react';
import SendOtpForm from '@/components/send-otp-form';

const VerifyEmailPage: React.FC = () => {
  return <SendOtpForm title="验证邮箱" purpose="verify-email" />;
};

export default VerifyEmailPage;
