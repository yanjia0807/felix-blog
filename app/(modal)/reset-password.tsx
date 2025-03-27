import React from 'react';
import SendOtpForm from '@/components/send-otp-form';

const VerifyEmailPage: React.FC = () => {
  return <SendOtpForm title="重置密码" purpose="reset-password" />;
};

export default VerifyEmailPage;
