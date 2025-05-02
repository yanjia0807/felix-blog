import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/components/auth-provider';
import Message from '../(app)/message';
import { ErrorBoundaryAlert } from '@/components/error';

const MessagePage: React.FC = () => {
  console.log('@render MessagePage');

  const { isLogin } = useAuth();
  return isLogin ? <Message /> : <Redirect href="/anony" />;
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <ErrorBoundaryAlert error={error} retry={retry} />
);

export default MessagePage;
