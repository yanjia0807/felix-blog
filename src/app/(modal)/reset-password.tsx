import React from 'react';
import { PageFallbackUI } from '@/components/fallback';
import SendOtpForm from '@/features/auth/components/send-otp-form';

const VerifyEmailPage: React.FC = () => {
  return <SendOtpForm title="重置密码" purpose="reset-password" />;
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default VerifyEmailPage;
