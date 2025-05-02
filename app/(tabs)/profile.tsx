import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/components/auth-provider';
import Profile from '../(app)/profile';
import { ErrorBoundaryAlert } from '@/components/error';

const ProfilePage: React.FC = () => {
  console.log('@render ProfilePage');

  const { isLogin } = useAuth();
  return isLogin ? <Profile /> : <Redirect href="/anony" />;
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <ErrorBoundaryAlert error={error} retry={retry} />
);

export default ProfilePage;
