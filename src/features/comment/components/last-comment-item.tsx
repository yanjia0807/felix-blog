import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { formatDistance } from '@/utils/date';
import { imageFormat } from '@/utils/file';
import React from 'react';

export const LastCommentItem: React.FC<any> = ({ item }) => {
  return (
    <>
      <HStack space="xs" className="items-center">
        <Text className="flex-1" size="sm" numberOfLines={3}>
          {item.content}
        </Text>
      </HStack>
      <HStack className="items-center justify-end" space="md">
        <HStack className="items-center" space="xs">
          <HStack className="items-center" space="xs">
            <Avatar size="xs">
              <AvatarFallbackText>{item.user.username}</AvatarFallbackText>
              <AvatarImage
                source={{
                  uri: imageFormat(item.user.avatar, 's', 't')?.fullUrl,
                }}
              />
            </Avatar>
            <Text size="sm">{item.user.username}</Text>
          </HStack>
          <Text size="xs">{formatDistance(item.createdAt)}</Text>
        </HStack>
      </HStack>
    </>
  );
};
