import React from 'react';
import SendOtpForm from '@/components/send-otp-form';
import { ErrorBoundaryAlert } from '@/components/error';

const VerifyEmailPage: React.FC = () => {
  return <SendOtpForm title="重置密码" purpose="reset-password" />;
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <ErrorBoundaryAlert error={error} retry={retry} />
);

export default VerifyEmailPage;
