import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import React from 'react';
import { baseURL } from '@/api/config';
import { useAuth } from './auth-context';
import { Avatar, AvatarFallbackText, AvatarImage } from './ui/avatar';
import { Box } from './ui/box';
import { Icon } from './ui/icon';
import { Pressable } from './ui/pressable';

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
