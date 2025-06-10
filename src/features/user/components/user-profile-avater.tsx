import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { imageFormat } from '@/utils/file';
import React from 'react';

export const UserProfileAvatar = ({ user }: any) => {
  return (
    <HStack className="items-center" space="md">
      <Avatar size="lg">
        {user.avatar ? (
          <AvatarImage
            source={{
              uri: imageFormat(user.avatar, 's', 't')?.fullUrl,
            }}
          />
        ) : (
          <AvatarFallbackText>{user.username}</AvatarFallbackText>
        )}
      </Avatar>
      <Text size="lg" bold={true}>
        {user.username}
      </Text>
    </HStack>
  );
};
