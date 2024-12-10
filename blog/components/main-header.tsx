import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { apiServerURL } from '@/api';
import { useAuth } from './auth-context';
import { Avatar, AvatarFallbackText, AvatarImage } from './ui/avatar';
import { HStack } from './ui/hstack';
import { Text } from './ui/text';

const MainHeader = () => {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <HStack className="h-14 items-center justify-between">
      <HStack className="p-3">
        <Text size="sm" className="text-primary-400">
          felix
        </Text>
        <Text size="2xl" bold={true}>
          博客
        </Text>
      </HStack>
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
        <></>
      )}
    </HStack>
  );
};

export default MainHeader;
