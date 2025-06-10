import { useAuth } from '@/features/auth/components/auth-provider';
import { Redirect } from 'expo-router';
import _ from 'lodash';
import React from 'react';
import Profile from '../users/(auth)/profile';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  return !_.isNil(user) ? <Profile /> : <Redirect href="/anony" />;
};

export default ProfilePage;
