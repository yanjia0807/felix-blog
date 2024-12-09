import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { useRouter } from 'expo-router';
import { User, UserCircle } from 'lucide-react-native';
import React from 'react';
import { apiServerURL } from '@/api/api-client';
import { useAuth } from './auth-context';
import { Avatar, AvatarFallbackText, AvatarImage } from './ui/avatar';
import { Box } from './ui/box';
import { Button, ButtonIcon } from './ui/button';
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
                uri: `${apiServerURL}/${user.profile?.avatar?.formats.thumbnail.url}`,
              }}
            />
          </Avatar>
        </Pressable>
      ) : (
        <Button
          variant="link"
          onPress={() => {
            router.navigate('/anonymous-setting');
          }}>
          <ButtonIcon as={UserCircle} size={26 as any} />
        </Button>
      )}
    </Box>
  );
};
