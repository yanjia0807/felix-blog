import React from 'react';
import { Redirect } from 'expo-router';
import _ from 'lodash';
import { PageFallbackUI } from '@/components/fallback';
import { useAuth } from '@/features/auth/components/auth-provider';
import Profile from '../users/(auth)/profile';

const ProfilePage: React.FC = () => {
  console.log('@render ProfilePage');

  const { user } = useAuth();
  return !_.isNil(user) ? <Profile /> : <Redirect href="/anony" />;
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default ProfilePage;
