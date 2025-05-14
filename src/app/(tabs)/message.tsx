import React from 'react';
import { Redirect } from 'expo-router';
import _ from 'lodash';
import { useAuth } from '@/components/auth-provider';
import { PageFallbackUI } from '@/components/fallback';
import Message from '../(app)/message';

const MessagePage: React.FC = () => {
  console.log('@render MessagePage');

  const { user } = useAuth();
  return !_.isNil(user) ? <Message /> : <Redirect href="/anony" />;
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default MessagePage;
