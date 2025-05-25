import React, { memo } from 'react';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Avatar, AvatarFallbackText, AvatarImage, AvatarBadge } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { imageFormat } from '@/utils/file';

export const FollowingsBarItem: React.FC<any> = memo(({ item }) => {
  const router = useRouter();
  const onPress = () => router.push(`/users/${item.documentId}`);

  return (
    <TouchableOpacity onPress={() => onPress()} className="mx-2">
      <VStack className="items-center" space="xs">
        <Avatar key={item.id} size="sm">
          <AvatarFallbackText>{item.username}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: imageFormat(item.avatar, 's', 't')?.fullUrl,
            }}
          />
          {item.isOnline && <AvatarBadge />}
        </Avatar>
        <Text size="xs">{item.username}</Text>
      </VStack>
    </TouchableOpacity>
  );
});
