import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { imageFormat } from '@/utils/file';
import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';

export const UserItem: React.FC<any> = memo(function UserItem({ item }) {
  const router = useRouter();

  const onPress = () => {
    router.push(`/users/${item.documentId}`);
  };

  return (
    <TouchableOpacity onPress={() => onPress()}>
      <Card size="sm" variant="ghost">
        <HStack className={`items-center`} space="md">
          <Avatar size="sm">
            <AvatarFallbackText>{item.username}</AvatarFallbackText>
            <AvatarImage
              source={{
                uri: imageFormat(item.avatar, 's', 't')?.fullUrl,
              }}
            />
          </Avatar>
          <VStack>
            <Text bold={true}>{item.username}</Text>
            <Text size="sm">{item.email}</Text>
          </VStack>
        </HStack>
      </Card>
    </TouchableOpacity>
  );
});
