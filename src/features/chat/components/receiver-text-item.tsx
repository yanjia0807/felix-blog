import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { imageFormat } from '@/utils/file';
import { format } from 'date-fns';
import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';

export const ReceiverTextItem: React.FC<any> = memo(function ReceiverTextItem({ item, otherUser }) {
  return (
    <TouchableOpacity>
      <HStack className="my-2 w-full items-center justify-between" space="xs">
        <HStack className="flex-1" space="xs">
          <Avatar size="xs">
            <AvatarFallbackText>{otherUser.username}</AvatarFallbackText>
            <AvatarImage
              source={{
                uri: imageFormat(otherUser.avatar, 's', 't')?.fullUrl,
              }}
            />
          </Avatar>
          <Card size="md" variant="elevated" className="flex-1 rounded-lg bg-primary-200 p-4">
            <Text>{item.content}</Text>
          </Card>
        </HStack>
        <Text size="xs" className="w-1/4 text-right">
          {format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}
        </Text>
      </HStack>
    </TouchableOpacity>
  );
});
