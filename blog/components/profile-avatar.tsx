import React from 'react';
import { Avatar, AvatarFallbackText, AvatarImage } from './ui/avatar';
import { useAuth } from './auth-context';
import { baseURL } from '@/api/config';
import { Icon } from './ui/icon';
import { User } from 'lucide-react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Pressable } from './ui/pressable';
import { useRouter } from 'expo-router';

const ProfileAvatarStyles = tva({});

export const ProfileAvatar = ({ className, ...props }: any) => {
  const { user } = useAuth();
  const router = useRouter();
  console.log('user', user);

  return (
    <>
      {user ? (
        <Pressable
          onPress={() => {
            router.navigate('/profile');
          }}>
          <Avatar size="sm" className={ProfileAvatarStyles({ className })}>
            <AvatarFallbackText>{user.username}</AvatarFallbackText>
            <AvatarImage
              source={{
                uri: `${baseURL}/${user.profile?.avatar?.formats.thumbnail.url}`,
              }}
            />
          </Avatar>
        </Pressable>
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
