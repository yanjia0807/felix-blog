import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { imageFormat } from '@/utils/file';
import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';

export const UserChatAvatar: React.FC<any> = memo(function UserChatAvatar({ user }) {
  const router = useRouter();

  if (!user) return null;

  return (
    <TouchableOpacity onPress={() => router.push(`/users/${user.documentId}`)}>
      <HStack className="items-center" space="sm">
        <Avatar size="md">
          {user?.avatar ? (
            <AvatarImage
              source={{
                uri: imageFormat(user.avatar, 's', 't')?.fullUrl,
              }}
            />
          ) : (
            <AvatarFallbackText>{user?.username}</AvatarFallbackText>
          )}
          {user?.isOnline && <AvatarBadge />}
        </Avatar>
        <VStack>
          <Text size="sm" bold={true}>
            {user?.username}
          </Text>
          {user?.isOnline ? (
            <Text size="xs" className="text-success-500">
              在线
            </Text>
          ) : (
            <Text size="xs" className="text-typography-500">
              离线
            </Text>
          )}
        </VStack>
      </HStack>
    </TouchableOpacity>
  );
});
