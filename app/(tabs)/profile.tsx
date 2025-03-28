import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/components/auth-provider';
import Profile from '../(app)/profile';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  return user ? <Profile /> : <Redirect href="/anony" />;
};

export default ProfilePage;
