import { useAuth } from '@/features/auth/components/auth-provider';
import { Redirect } from 'expo-router';
import _ from 'lodash';
import React from 'react';
import ChatList from '../chats/(auth)/list';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  return !_.isNil(user) ? <ChatList /> : <Redirect href="/anony" />;
};

export default ChatPage;
