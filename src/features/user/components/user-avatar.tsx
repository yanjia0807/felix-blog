import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { imageFormat } from '@/utils/file';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

export const UserAvatar = ({ user, size = 'sm' }: any) => {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push(`/users/${user.documentId}`)}>
      <HStack className="items-center" space={size}>
        <Avatar size={size}>
          {user?.avatar ? (
            <AvatarImage
              source={{
                uri: imageFormat(user.avatar, 's', 't')?.fullUrl,
              }}
            />
          ) : (
            <AvatarFallbackText>{user?.username}</AvatarFallbackText>
          )}
        </Avatar>
        <Text size={size}>{user?.username}</Text>
      </HStack>
    </TouchableOpacity>
  );
};
