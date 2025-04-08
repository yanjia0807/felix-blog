import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/components/auth-provider';
import Message from '../(app)/message';

const MessagePage: React.FC = () => {
  console.log('@render MessagePage');

  const { isLogin } = useAuth();
  return isLogin ? <Message /> : <Redirect href="/anony" />;
};

export default MessagePage;
