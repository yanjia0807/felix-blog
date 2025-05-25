import React from 'react';
import { Avatar, AvatarImage, AvatarFallbackText } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { imageFormat } from '@/utils/file';

const ChatItem: React.FC<any> = ({ otherUser, onItemPress }) => {
  return (
    <Card size="sm">
      <HStack space="sm" className="items-center">
        <Avatar size="md">
          {otherUser.avatar ? (
            <AvatarImage
              source={{
                uri: imageFormat(otherUser.avatar, 's', 't')?.fullUrl,
              }}
            />
          ) : (
            <AvatarFallbackText>{otherUser.username}</AvatarFallbackText>
          )}
        </Avatar>
        <Text size="sm" bold={true}>
          {otherUser.username}
        </Text>
      </HStack>
    </Card>
  );
};

export default ChatItem;
