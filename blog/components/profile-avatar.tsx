import React from 'react';
import { Avatar, AvatarFallbackText, AvatarImage } from './ui/avatar';
import { useAuth } from './auth-context';
import { baseURL } from '@/api/config';
import { Icon } from './ui/icon';
import { User } from 'lucide-react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Pressable } from './ui/pressable';
import { useRouter } from 'expo-router';
import { Box } from './ui/box';

const ProfileAvatarStyles = tva({});

export const ProfileAvatar = ({ className, ...props }: any) => {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <Box className={ProfileAvatarStyles({ className })}>
      {user ? (
        <Pressable
          onPress={() => {
            router.navigate('/setting');
          }}>
          <Avatar size="sm">
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
          }}>
          <Icon as={User} />
        </Pressable>
      )}
    </Box>
  );
};
