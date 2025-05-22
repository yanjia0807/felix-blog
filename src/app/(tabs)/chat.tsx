import React from 'react';
import { Redirect } from 'expo-router';
import _ from 'lodash';
import { PageFallbackUI } from '@/components/fallback';
import { useAuth } from '@/features/auth/components/auth-provider';
import ChatList from '../chats/(auth)/list';

const ChatPage: React.FC = () => {
  console.log('@render ChatPage');

  const { user } = useAuth();
  return !_.isNil(user) ? <ChatList /> : <Redirect href="/anony" />;
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default ChatPage;
