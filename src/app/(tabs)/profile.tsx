import React from 'react';
import { Redirect } from 'expo-router';
import _ from 'lodash';
import { useAuth } from '@/components/auth-provider';
import { PageFallbackUI } from '@/components/fallback';
import Profile from '../(app)/profile';

const ProfilePage: React.FC = () => {
  console.log('@render ProfilePage');

  const { user } = useAuth();
  return !_.isNil(user) ? <Profile /> : <Redirect href="/anony" />;
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default ProfilePage;
