import { View, Text } from 'react-native';
import React from 'react';
import { Avatar, AvatarFallbackText, AvatarImage, AvatarBadge } from './ui/avatar';
import { useAuth } from './auth-context';
import { baseURL } from '@/api/config';
import { Icon } from './ui/icon';
import { LogIn, User } from 'lucide-react-native';
import { ButtonGroup, Button, ButtonText, ButtonSpinner, ButtonIcon } from './ui/button';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Pressable } from './ui/pressable';
import { useRouter } from 'expo-router';

const ProfileAvatarStyles = tva({});

export const ProfileAvatar = ({ className, ...props }: any) => {
  const { user } = useAuth();
  const router = useRouter();
  return (
    <>
      {user ? (
        <Avatar size="sm" className={ProfileAvatarStyles({ className })}>
          <AvatarFallbackText>{user.username}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: `${baseURL}/${user.profile?.avatar?.formats.thumbnail.url}`,
            }}
          />
        </Avatar>
      ) : (
        <Pressable
          onPress={() => {
            router.navigate('/register');
          }}
          className={ProfileAvatarStyles({ className })}>
          <Icon as={User} />
        </Pressable>
      )}
    </>
  );
};
