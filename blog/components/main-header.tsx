import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { apiServerURL } from '@/api';
import { useAuth } from './auth-context';
import { Avatar, AvatarFallbackText, AvatarImage } from './ui/avatar';
import { HStack } from './ui/hstack';
import { Image } from './ui/image';

const MainHeader = ({ className }: any) => {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <HStack className={twMerge('items-center justify-between', className)}>
      <HStack className="p-3">
        <Image alt="logo" source={require('/assets/images/icon.png')} size="sm" />
      </HStack>
      {user ? (
        <Pressable
          onPress={() => {
            router.navigate('/setting');
          }}>
          <Avatar size="md">
            <AvatarFallbackText>{user.username}</AvatarFallbackText>
            <AvatarImage
              alt=""
              source={{
                uri: `${apiServerURL}/${user.profile?.avatar?.formats.thumbnail.url}`,
              }}
            />
          </Avatar>
        </Pressable>
      ) : (
        <></>
      )}
    </HStack>
  );
};

export default MainHeader;
