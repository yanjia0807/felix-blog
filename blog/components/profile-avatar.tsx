import { View, Text } from 'react-native';
import React from 'react';
import { Avatar, AvatarFallbackText, AvatarImage, AvatarBadge } from './ui/avatar';
import { useAuth } from './auth-context';
import { baseURL } from '@/api/config';
import { Icon } from './ui/icon';
import { LogIn, User } from 'lucide-react-native';
import { ButtonGroup, Button, ButtonText, ButtonSpinner, ButtonIcon } from './ui/button';

export const ProfileAvatar = () => {
  const { user } = useAuth();
  return (
    <>
      {user ? (
        <Avatar size="sm" className="mx-2">
          <AvatarFallbackText>{user.username}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: `${baseURL}/${user.profile?.avatar?.formats.thumbnail.url}`,
            }}
          />
        </Avatar>
      ) : (
        <ButtonGroup space="sm" className="mx-2">
          <Button size="sm" variant="link">
            <ButtonText>未登录</ButtonText>
          </Button>
        </ButtonGroup>
      )}
    </>
  );
};
