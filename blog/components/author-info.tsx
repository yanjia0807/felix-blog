import { router } from 'expo-router';
import React from 'react';
import { apiServerURL } from '@/api';
import { useAuth } from './auth-context';
import { Avatar, AvatarFallbackText, AvatarImage } from './ui/avatar';
import { HStack } from './ui/hstack';
import { Pressable } from './ui/pressable';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

const AuthorInfo = ({ author }: any) => {
  const { user } = useAuth();

  const onAvatarPress = (documentId: string) => {
    if (user?.documentId === documentId) {
      router.push('/profile');
    } else {
      router.push(`/users/${documentId}`);
    }
  };
  return (
    <Pressable onPress={() => onAvatarPress(author.documentId)}>
      <HStack className="items-center" space="sm">
        <Avatar size="sm">
          {author.avatar && (
            <AvatarImage
              source={{
                uri: `${apiServerURL}${author.avatar.formats.thumbnail.url}`,
              }}
            />
          )}
          <AvatarFallbackText>{author.username}</AvatarFallbackText>
        </Avatar>
        <VStack>
          <Text size="sm" bold={true}>
            {author.username}
          </Text>
        </VStack>
      </HStack>
    </Pressable>
  );
};

export default AuthorInfo;
