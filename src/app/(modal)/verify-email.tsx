import React from 'react';
import { PageFallbackUI } from '@/components/fallback';
import SendOtpForm from '@/features/auth/components/send-otp-form';

const VerifyEmailPage: React.FC = () => {
  return <SendOtpForm title="验证邮箱" purpose="verify-email" />;
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default VerifyEmailPage;
